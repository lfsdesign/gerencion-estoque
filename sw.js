// ============================================================
// KILL-SWITCH SERVICE WORKER — Gerencion Estoque
// ------------------------------------------------------------
// Este arquivo existe APENAS para desativar qualquer service
// worker antigo que ainda esteja preso no dispositivo de um
// usuário. Ele NÃO faz cache de nada. Ele se remove sozinho.
//
// Como funciona: navegadores checam o sw.js periodicamente.
// Quando um cliente preso baixar esta versão, ela apaga todos
// os caches, se desregistra e recarrega a página com a versão
// nova do servidor — tudo automático, sem o usuário fazer nada.
// ============================================================

self.addEventListener('install', function(event) {
  // Assume o controle imediatamente, sem esperar.
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    (async function() {
      try {
        // 1) Apaga TODOS os caches que o SW antigo tenha criado.
        var keys = await caches.keys();
        await Promise.all(keys.map(function(k) { return caches.delete(k); }));
      } catch (e) {}

      try {
        // 2) Assume controle de todas as abas/janelas abertas.
        await self.clients.claim();
      } catch (e) {}

      try {
        // 3) Se desregistra — o service worker deixa de existir.
        await self.registration.unregister();
      } catch (e) {}

      try {
        // 4) Recarrega todas as páginas controladas para que
        //    passem a buscar tudo direto do servidor (versão nova).
        var clientsList = await self.clients.matchAll({ type: 'window' });
        clientsList.forEach(function(client) {
          client.navigate(client.url);
        });
      } catch (e) {}
    })()
  );
});

// Enquanto ainda estiver ativo por um instante, NÃO intercepta
// nada: deixa todas as requisições irem direto para a rede.
// (Ausência de listener 'fetch' = navegador usa a rede normal.)
