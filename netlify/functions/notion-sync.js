// netlify/functions/notion-sync.js
// Proxy serverless para API do Notion — resolve CORS no cliente

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Notion-Token, X-Notion-DB',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const token = event.headers['x-notion-token'];
  const dbId  = event.headers['x-notion-db'];
  const action = event.queryStringParameters?.action || 'pull';

  if (!token || !dbId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Token e DB ID obrigatórios' }) };
  }

  const notionHeaders = {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  };

  try {
    if (action === 'pull') {
      // Busca tarefas do Notion
      const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify({
          filter: { property: 'Status', select: { does_not_equal: 'Concluída' } },
          sorts: [{ property: 'Prioridade', direction: 'descending' }],
          page_size: 50,
        }),
      });
      const data = await res.json();

      // Mapeia páginas do Notion pra formato da Carol
      const tarefas = (data.results || []).map(page => ({
        notionId: page.id,
        titulo: page.properties?.Name?.title?.[0]?.plain_text || 'Sem título',
        prio: mapPrioridade(page.properties?.Prioridade?.select?.name),
        ctx: mapContexto(page.properties?.Contexto?.select?.name),
        prazo: page.properties?.Prazo?.date?.start || '',
        done: page.properties?.Status?.select?.name === 'Concluída',
        nota: page.properties?.Notas?.rich_text?.[0]?.plain_text || '',
      }));

      return { statusCode: 200, headers, body: JSON.stringify({ tarefas }) };

    } else if (action === 'push') {
      // Recebe lista de tarefas do body e cria/atualiza no Notion
      const body = JSON.parse(event.body || '{}');
      const { tarefas = [] } = body;
      const results = [];

      for (const t of tarefas) {
        const properties = {
          'Name':       { title: [{ text: { content: t.titulo } }] },
          'Status':     { select: { name: t.done ? 'Concluída' : 'Em andamento' } },
          'Prioridade': { select: { name: prioParaNotion(t.prio) } },
          'Contexto':   { select: { name: ctxParaNotion(t.ctx) } },
          ...(t.prazo ? { 'Prazo': { date: { start: t.prazo } } } : {}),
          ...(t.nota ? { 'Notas': { rich_text: [{ text: { content: t.nota } }] } } : {}),
        };

        let res;
        if (t.notionId && !t.notionId.startsWith('pending_')) {
          // Atualiza página existente
          res = await fetch(`https://api.notion.com/v1/pages/${t.notionId}`, {
            method: 'PATCH',
            headers: notionHeaders,
            body: JSON.stringify({ properties }),
          });
        } else {
          // Cria nova página
          res = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: notionHeaders,
            body: JSON.stringify({ parent: { database_id: dbId }, properties }),
          });
        }
        const data = await res.json();
        results.push({ id: t.id, notionId: data.id });
      }

      return { statusCode: 200, headers, body: JSON.stringify({ results, synced: results.length }) };

    } else if (action === 'test') {
      // Testa conexão
      const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, { headers: notionHeaders });
      const data = await res.json();
      return {
        statusCode: res.ok ? 200 : 400,
        headers,
        body: JSON.stringify({ ok: res.ok, title: data.title?.[0]?.plain_text || 'Database encontrado' }),
      };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Ação inválida' }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

function mapPrioridade(v) {
  const m = { 'Crítica': 'critica', 'Alta': 'alta', 'Média': 'media', 'Baixa': 'baixa' };
  return m[v] || 'media';
}
function mapContexto(v) {
  const m = { 'APEX': 'apex', 'Pessoal': 'pessoal', 'Freela': 'freela' };
  return m[v] || 'pessoal';
}
function prioParaNotion(v) {
  const m = { critica: 'Crítica', alta: 'Alta', media: 'Média', baixa: 'Baixa' };
  return m[v] || 'Média';
}
function ctxParaNotion(v) {
  const m = { apex: 'APEX', pessoal: 'Pessoal', freela: 'Freela' };
  return m[v] || 'Pessoal';
}
