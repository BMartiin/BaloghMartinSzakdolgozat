# **BaloghMartinSzakdolgozat**

Ez az adattár Balogh Martin szakdolgozatához kapcsolódó minden digitális állományt, forráskódot és dokumentációt tartalmaz.

**Az adattár mappaszerkezete és tartalma**

* CodeSiegeForráskód: A Unity játékmotorban fejlesztett Code Siege oktatójáték teljes C# forráskódját tartalmazza.
* CodeSiegeFuttatható: Itt található a játék WebGL platformra exportált változata.
* KépekÉsVideók: Tartalmazza a felhasználói élményt bemutató képeket és videókat.
* SzakdolgozatDokumentum: Tartalmazza a szakdolgozat végleges változatát PDF formátumban (szakdolgozat.pdf), valamint a dolgozat elkészítéséhez használt teljes LaTeX forráskódot és a hozzá tartozó ábrákat.
* SzerverKód: A server.js file-t tartalmazza.
* README.md: Az adattár gyökérkönyvtárában található dokumentum.

**Fejlesztési előzmények**

A szoftver fejlesztése során a https://github.com/BMartiin/OOPEduTowerDefenseGame repozitóriumot használtam. A projekt és a Code Siege fejlesztése során beküldött összes korábbi commit ebben az elkülönített fejlesztői környezetben tekinthető meg.

**WebGL játék futtatása (Útmutató)**

A legtöbb modern böngésző biztonsági okokból (CORS korlátozások) nem engedélyezi a WebGL tartalom közvetlen futtatását a helyi fájlrendszerről, tehát a fájlra való dupla kattintással nem indul el. A játék futtatásához egy helyi webszerverre van szükség.

Futtatás lépései:

* Navigáljon a CodeSiegeFuttatható mappába.
* Indítson egy helyi webszervert az alábbi módszerek egyikével:
* Python esetén: `python -m http.server 8000` parancs a terminálban.
* Node.js esetén: `npx http-server` parancs használata.
* VS Code esetén: a Live Server kiterjesztés használata.
* Nyissa meg a böngészőt, és keresse fel a http://localhost:8000 címet a játék elindításához.

Ez a videó bemutatja, hogyan lehet Python használatával egyszerűen helyi szervert indítani a WebGL projektek teszteléséhez: https://www.youtube.com/watch?v=bdwftOgNudU
