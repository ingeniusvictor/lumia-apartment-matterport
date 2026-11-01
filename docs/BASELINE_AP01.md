# AP-01 — Baseline del upstream preservada

- Repositorio: ingeniusvictor/lumia-apartment-matterport
- Rama base: research/ap01-upstream-baseline
- Commit base: 70af8c842081d7c144acb4d31d41b394034406db
- Upstream: rebane2001/matterport-dl
- Upstream commit: 4ec8c4bffbf0864c0879f81fec4d1f1fd3ec38c9
- Upstream tree: b53c7074f7d5ba652449480806bff5dcc9696e69
- vendor/matterport-dl tree Git verificado idéntico al upstream.
- 28 archivos originales + .gitattributes de protección en baseline.
- Licencia del código upstream: Unlicense. No cubre los recorridos ni recursos Matterport de terceros.
- NO ejecutar matterport-dl.py ni descargar recorridos sin permisos.
- Todas las modificaciones propias se realizan fuera de vendor y en ramas nuevas.

Comprobación recomendada tras clonar, en Git Bash:
git rev-parse HEAD:vendor/matterport-dl
Debe dar: b53c7074f7d5ba652449480806bff5dcc9696e69
