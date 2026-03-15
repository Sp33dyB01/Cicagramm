import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, Server, Users, UserCheck } from "lucide-react";

export default function Aszf() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 py-12 px-4 transition-colors pt-[90px]">
      <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8 md:p-12">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-rose-100 dark:bg-rose-900/30 rounded-full mb-4">
            <Shield className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Adatkezelési Tájékoztató</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Üdvözlünk a Cicagramm platformján! Számunkra nagyon fontos a magánszférád és a személyes adataid védelme. Ebben a tájékoztatóban röviden és érthetően leírjuk, milyen adatokat gyűjtünk rólad a platform használata során, miért van ezekre szükségünk, és hogyan vigyázunk rájuk.
          </p>
        </div>

        <div className="space-y-8">

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-2">
              <span className="text-rose-500">1.</span> Az Adatkezelő (Kik vagyunk mi?)
            </h2>
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-5 border border-neutral-100 dark:border-neutral-700/50">
              <p className="mb-2">Adataid kezelője és a weboldal üzemeltetője:</p>
              <ul className="space-y-2 font-medium">
                <li><span className="text-neutral-500 dark:text-neutral-400 font-normal">Hivatalos név:</span> Cicagramm Kft.</li>
                <li><span className="text-neutral-500 dark:text-neutral-400 font-normal">Székhely:</span> Kiskunhalas</li>
                <li><span className="text-neutral-500 dark:text-neutral-400 font-normal">Adatvédelmi kapcsolattartó e-mail címe:</span> <a href="mailto:support@cicagramm.hu" className="text-rose-500 hover:underline">support@cicagramm.hu</a></li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-2">
              <span className="text-rose-500">2.</span> Milyen adatokat kezelünk, miért és meddig?
            </h2>
            <p className="mb-6">A weboldal funkcióinak használatához különböző adatokat kérünk be. Adataidat kizárólag addig tároljuk, amíg a profilod aktív. Ha törlöd a fiókodat, az összes személyes adatodat és posztodat véglegesen töröljük a rendszerünkből.</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-6 border border-neutral-100 dark:border-neutral-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="w-6 h-6 text-rose-500" />
                  <h3 className="text-lg font-bold">Regisztrációs és profiladatok</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li><strong className="text-neutral-700 dark:text-neutral-300">Kezelt adatok:</strong> E-mail cím, Felhasználónév, Jelszó (kizárólag titkosítva), Tartózkodási hely, Telefonszám.</li>
                  <li><strong className="text-neutral-700 dark:text-neutral-300">Célja:</strong> Fiók létrehozása, felhasználó azonosítása, valamint a gazdikeresők és az örökbefogadók közötti közvetlen kapcsolatfelvétel biztosítása.</li>
                  <li><strong className="text-neutral-700 dark:text-neutral-300">Jogalap:</strong> A regisztrációval elfogadott Felhasználási Feltételek (szerződés teljesítése), illetve a te kifejezett hozzájárulásod.</li>
                </ul>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-6 border border-neutral-100 dark:border-neutral-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 text-rose-500 flex items-center justify-center">🐱</div>
                  <h3 className="text-lg font-bold">Macskás posztok adatai</h3>
                </div>
                <ul className="space-y-3 text-sm">
                  <li><strong className="text-neutral-700 dark:text-neutral-300">Kezelt adatok:</strong> Az általad feltöltött képek a macskákról, a cicák leírásai, valamint az örökbefogadási szándékhoz kötődő rendszeren belüli tevékenységeid.</li>
                  <li><strong className="text-neutral-700 dark:text-neutral-300">Célja:</strong> Az örökbefogadási platform működtetése, az állatok gazdához juttatása.</li>
                  <li><strong className="text-neutral-700 dark:text-neutral-300">Jogalap:</strong> A te kifejezett hozzájárulásod (amit a posztolással és a rendszer használatával adsz meg).</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-2">
              <span className="text-rose-500">3.</span> Hogyan vigyázunk az adataidra? (Adatbiztonság)
            </h2>
            <div className="flex items-start gap-4">
              <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-xl shrink-0">
                <Lock className="w-6 h-6 text-rose-500" />
              </div>
              <p className="pt-1">Modern biztonsági megoldásokat alkalmazunk, hogy az adataid ne kerülhessenek illetéktelen kezekbe. A jelszavadat sosem tároljuk nyílt formátumban; WebCrypto API alapú, iparági standard titkosítást alkalmazunk, így még mi sem láthatjuk a jelszavadat.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-2">
              <span className="text-rose-500">4.</span> Adatfeldolgozók (Kik látják még az adatokat?)
            </h2>
            <p className="mb-4">Ahhoz, hogy az oldal gyors és biztonságos legyen, külsős technológiai partnereket (Adatfeldolgozókat) veszünk igénybe. Ők a mi utasításaink alapján, szigorú titoktartási szabályok mellett kezelik az adatokat:</p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                <Server className="w-6 h-6 text-neutral-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold">Cloudflare, Inc. (Infrastruktúra szolgáltató)</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Az oldal működtetését, az adatbázis tárolását (Cloudflare D1) és a feltöltött cicás képek tárolását (Cloudflare R2 Storage), valamint a szerveroldali logikát (Cloudflare Worker) biztosítják.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                <Users className="w-6 h-6 text-neutral-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold">Better-Auth (Hitelesítési szolgáltató)</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">A biztonságos regisztrációs és bejelentkezési rendszert (munkamenetek kezelését) biztosító szoftveres megoldás.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl text-sm font-medium">
              Megjegyzés: Külön hírlevélküldő rendszert nem használunk, kéretlen reklámlevelekkel nem fogunk zavarni.
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-2">
              <span className="text-rose-500">5.</span> Milyen jogaid vannak?
            </h2>
            <p className="mb-4">A GDPR értelmében az alábbi jogokkal rendelkezel a saját adataid felett:</p>

            <ul className="space-y-3">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                <div><strong className="text-neutral-800 dark:text-neutral-200">Hozzáférés joga:</strong> Bármikor kikérheted, milyen adatokat tárolunk rólad.</div>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                <div><strong className="text-neutral-800 dark:text-neutral-200">Helyesbítés joga:</strong> Ha egy adatod megváltozott (pl. új telefonszám), frissítheted a profilodban.</div>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                <div><strong className="text-neutral-800 dark:text-neutral-200">Törléshez (elfeledtetéshez) való jog:</strong> Bármikor törölheted a fiókodat és az összes adatodat a platformról.</div>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0"></div>
                <div><strong className="text-neutral-800 dark:text-neutral-200">Panasztétel joga:</strong> Bár bízunk benne, hogy mindent meg tudunk oldani a <a href="mailto:support@cicagramm.hu" className="text-rose-500 hover:underline">support@cicagramm.hu</a> címen, ha mégis úgy érzed, hogy megsértettük az adataid védelmét, a Nemzeti Adatvédelmi és Információszabadság Hatósághoz (NAIH) fordulhatsz panasszal.</div>
              </li>
            </ul>
          </section>

        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 px-6 py-2.5 rounded-full font-medium transition-colors">
            Vissza a Főoldalra
          </Link>
        </div>

      </div>
    </div>
  );
}
