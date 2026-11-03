// ===== الأداة العامة واختيار العناصر =====
const $ = (s) => document.querySelector(s);
const app = $('#app');

// ===== الحالة العامة للتطبيق (State) =====
const S = {
  sec: 0,   // القسم الحالي
  sc: 0,    // مرحلة الشرح الحالية
  wl: [],   // قائمة الكلمات
  wi: 0,    // مؤشر الكلمة الحالية
  wr: [],   // نتائج الكلمات
  ql: [],   // قائمة الأسئلة
  qi: 0,    // مؤشر السؤال الحالي
  qr: []    // نتائج الأسئلة
};

// الترتيب الجديد: الشرح -> الأسئلة -> الكلمات -> النتيجة
const NAMES = ['الشرح', 'الأسئلة', 'الكلمات', 'النتيجة'];

// خلط مصفوفة عشوائياً
const sh = (a) => [...a].sort(() => Math.random() - .5);

// دالة إصدار الأصوات
function beep(ok) {
  try {
    const c = new (window.AudioContext || window.webkitAudioContext)();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.frequency.value = ok ? 880 : 200;
    g.gain.value = .07;
    o.start();
    o.stop(c.currentTime + .15);
  } catch (e) { }
}

// دالة الاحتفال (Confetti)
function confetti() {
  for (let i = 0; i < 40; i++) {
    const e = document.createElement('span');
    e.className = 'cf';
    e.textContent = ['🎉', '⭐', '✨', '🎊'][i % 4];
    e.style.cssText = `left:${Math.random() * 100}vw; animation-delay:${Math.random() * 1.5}s; font-size:${16 + Math.random() * 16}px`;
    document.body.appendChild(e);
    setTimeout(() => e.remove(), 5000);
  }
}

// تحديث شريط الخطوات العلوي
function nav() {
  $('#steps').innerHTML = NAMES.map((n, i) => `
    <span class="st ${i == S.sec ? 'on' : ''} ${i < S.sec ? 'ok' : ''}">${n}</span>
  `).join('');
}

// التنقل بين الأقسام الرئيسية بالترتيب الجديد
function go(i) {
  S.sec = i;
  nav();
  [learn, quizIntro, words, result][i]();
  scrollTo(0, 0);
}


/* ==========================================
   1) الشرح التفاعلي (Interactive Lessons)
   ========================================== */
const ok = () => {
  const n = $('#nx');
  n.disabled = false;
  n.classList.add('pulse');
};

// نافذة تأكيد جميلة بدل alert (بتتقفل بالضغط بره أو بزرار Esc)
function confirmBox(icon, title, text, yes, no, fn) {
  const o = document.createElement('div');
  o.className = 'modal';
  o.innerHTML = `<div class="mbox"><div class="mic">${icon}</div><h3>${title}</h3><p>${text}</p><div class="mbtn"><button class="btn ghost" data-a="n">${no}</button><button class="btn" data-a="y">${yes}</button></div></div>`;
  const close = () => { o.remove(); document.removeEventListener('keydown', esc); };
  const esc = (e) => { if (e.key == 'Escape') close(); };
  document.addEventListener('keydown', esc);
  o.onclick = (e) => { if (e.target == o) close(); };
  o.querySelector('[data-a=n]').onclick = close;
  o.querySelector('[data-a=y]').onclick = () => { close(); fn(); };
  document.body.appendChild(o);
  o.querySelector('[data-a=n]').focus();
}

function learn() {
  S.sc = 0;
  app.innerHTML = `
    <section class="card">
      <div class="dots" id="dots"></div>
      <div id="scene"></div>
      <div class="bar"><button class="btn" id="nx"></button><button class="btn ghost" id="lsk">تخطي الشرح ⏭</button></div>
    </section>
  `;
  $('#lsk').onclick = () => confirmBox('⏭', 'تخطي الشرح؟', 'الشرح بيساعدك تفهم القاعدة قبل الأسئلة. متأكد إنك عايز تتخطاه وتروح للأسئلة؟', 'أيوه، تخطّى', 'لأ، أكمل الشرح', () => go(1));
  scene();
}

function scene() {
  $('#dots').innerHTML = SC.map((_, i) => `<i class="${i <= S.sc ? 'on' : ''}"></i>`).join('');
  const n = $('#nx'), last = S.sc == SC.length - 1;
  n.disabled = true;
  n.classList.remove('pulse');
  n.textContent = last ? 'يلا للأسئلة 🚀' : 'التالي ◀';
  n.onclick = () => last ? go(1) : (S.sc++, scene());
  SC[S.sc]();
}

const TASK = (t, m) => `<div class="task"><span>🎯 ${t}</span>${m ? `<b class="pg" id="pg">0/${m}</b>` : ''}</div>`;
const pg = (n, m) => { const e = $('#pg'); if (e) { e.textContent = n + '/' + m; e.classList.toggle('done', n >= m); } };
const say = (t, c) => { const m = $('#m'); m.style.color = c || 'var(--g)'; m.innerHTML = t; };
const SC = [sBut, sGate, sHow, sSwap, sRole, sAdj, sFlip, sTable, sBuild];

function sBut() {
  $('#scene').innerHTML = `<h2>الجسر <code>but</code> 🌉</h2><p>جملتين عكس بعض، وكلمة <code>but</code> هي الجسر اللي بيوصلهم.</p>${TASK('اضغط على الزرار الأزرق <code>but</code> وشوف هيتحط فين')}
  <div class="row"><div class="chip a">He is rich</div><div class="gap wait" id="gap">؟</div><div class="chip b">he is not happy</div></div>
  <button class="word" id="bt">👆 but</button><div class="msg" id="m"></div>`;
  $('#bt').onclick = () => { const g = $('#gap'); g.innerHTML = ', but'; g.classList.remove('wait'); g.classList.add('filled'); $('#bt').remove(); say('✅ الفاصلة <code>,</code> بتيجي <b>قبل</b> <code>but</code>، وبعدها جملة كاملة، ومعناها <b>لكن</b>'); beep(1); ok(); };
}

const GR = [
  { f: 'it was raining', c: 0, full: '<em>Although</em> it was raining, we went for a walk.', h: 'it was raining فيها فاعل وفعل = Clause' },
  { f: 'the cold weather', c: 1, full: '<em>Despite</em> the cold weather, she wore a T-shirt.', h: 'the cold weather اسم من غير فعل = Phrase' },
  { f: 'he was very tired', c: 0, full: '<em>Even though</em> he was very tired, he finished the work.', h: 'he was very tired فيها فاعل وفعل = Clause' },
  { f: 'being tired', c: 1, full: '<em>In spite of</em> being tired, he finished the work.', h: 'being tired هي v-ing = Phrase' }
];
function sGate() {
  let i = 0;
  const draw = () => {
    const r = GR[i];
    $('#scene').innerHTML = `<h2>بوابتين: Clause / Phrase 🚪</h2><p><code>Clause</code> = جملة كاملة (فاعل + فعل) ← تاخد <code>Although</code> أو <code>Even though</code><br><code>Phrase</code> = اسم أو <code>v-ing</code> ← تاخد <code>Despite</code> أو <code>In spite of</code></p>
    ${TASK('اختار الرابط المناسب للمكان الفاضي ؟ في الجملة', GR.length)}
    <div class="chip big" id="cd" style="display:block;text-align:left">${r.full.replace(/<em>.*?<\/em>/, '<span class="gap wait">؟</span>')}</div>
    <div class="pills"><button class="pill" data-c="0">Although / Even though</button><button class="pill" data-c="1">Despite / In spite of</button></div>
    <div class="msg" id="m"></div><div id="nxq"></div>`;
    pg(i, GR.length);
    document.querySelectorAll('.pill').forEach(b => b.onclick = () => {
      if (+b.dataset.c == r.c) {
        beep(1); $('#cd').innerHTML = r.full; b.classList.add('on');
        document.querySelectorAll('.pill').forEach(x => x.disabled = true);
        i++; pg(i, GR.length); say('✅ صح! ' + r.h);
        if (i < GR.length) { $('#nxq').innerHTML = '<button class="btn" id="g2" style="display:block;margin:10px auto">الجملة اللي بعدها ➜</button>'; $('#g2').onclick = draw; }
        else { ok(); say('🎉 خلصت الأربع جمل! ' + r.h); }
      } else {
        beep(0); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400);
        say('❌ لأ، جرب الزرار التاني — ' + r.h, 'var(--r)');
      }
    });
  };
  draw();
}

const HW = [
  ['. However,', 'He was ill. <em>However</em>, he went to school.', 'في أول جملة جديدة + فاصلة بعدها'],
  [' ; however,', 'He was ill<em>;</em> <em>however</em>, he went to school.', 'فاصلة منقوطة قبلها + فاصلة بعدها'],
  [', but', 'He was ill<em>,</em> <em>but</em> he went to school.', 'فاصلة قبلها بس، ومفيش فاصلة بعدها']
];
function sHow() {
  const seen = new Set();
  $('#scene').innerHTML = `<h2>الرابط بيتنقل 🧩</h2><p>نفس الجملتين، بس بنربطهم بطرق مختلفة.</p>${TASK('اضغط على كل زرار من التلاتة وشوف علامات الترقيم بتتغير إزاي', 3)}
  <div class="pills">${HW.map((h, i) => `<button class="pill" data-i="${i}">${h[0]}</button>`).join('')}</div>
  <div class="chip big" style="display:block;text-align:left" id="hs">He was ill ... he went to school</div><div class="msg" id="m"></div>`;
  document.querySelectorAll('.pill').forEach(b => b.onclick = () => {
    const h = HW[b.dataset.i], x = $('#hs');
    document.querySelectorAll('.pill').forEach(y => y.classList.remove('on')); b.classList.add('on');
    x.innerHTML = h[1]; x.classList.remove('shake'); void x.offsetWidth; x.classList.add('shake');
    say(h[2]); seen.add(b.dataset.i); pg(seen.size, 3); if (seen.size == 3) ok();
  });
}

const SW = { Although: ['<em>Although</em> he is rich, he isn\'t happy.', 'He isn\'t happy <em>although</em> he is rich.'], Despite: ['<em>Despite</em> his height, he couldn\'t hang the picture.', 'He couldn\'t hang the picture <em>despite</em> his height.'] };
function sSwap() {
  const d = new Set(); let k = 'Although', p = 0;
  const draw = () => {
    $('#scene').innerHTML = `<h2>الرابط بيتنقل في الجملة 🔄</h2><p><code>Although</code> / <code>Despite</code> ينفع يبقوا في الأول أو في النص. في الأول بنحط فاصلة، وفي النص مفيش فاصلة.</p>${TASK('لكل رابط من الاتنين: اضغط "اقلب الجملة" وشوف الفاصلة راحت فين', 2)}
    <div class="pills">${Object.keys(SW).map(x => `<button class="pill ${x == k ? 'on' : ''}" data-k="${x}">${x}</button>`).join('')}</div>
    <div class="chip big shake" style="display:block;text-align:left">${SW[k][p]}</div>
    <button class="btn" id="fl" style="display:block;margin:10px auto">🔄 اقلب الجملة</button><div class="msg" id="m"></div>`;
    pg(d.size, 2);
    document.querySelectorAll('.pill').forEach(b => b.onclick = () => { k = b.dataset.k; p = 0; draw(); });
    $('#fl').onclick = () => { p = 1 - p; if (p) d.add(k); beep(1); draw(); say(p ? '👀 مفيش فاصلة هنا' : '👀 فاصلة بعد الجزء الأول'); if (d.size == 2) ok(); };
  };
  draw();
}

const RL = [[['While it is true that fast food is delicious,', '١- نعترف بالجانب الحلو الأول', 'a'], ['it is very unhealthy.', '٢- وبعدين نقول الجانب المهم اللي عايزينه', 'b']],
[['It may be argued that exams are unfair,', '١- وجهة نظر ممكن حد يقولها', 'a'], ['but', '٢- نرجع بـ but ونعارض', 'gap filled'], ['they are necessary to test skills.', '٣- رأينا الحقيقي', 'b']]];
function sRole() {
  const seen = new Set();
  $('#scene').innerHTML = `<h2>اعترف الأول... وبعدين عارض 🎭</h2><p>مع <code>While it is true that</code> / <code>It may be argued that</code> بنعرض الجانب التاني الأول، وبعدين نقول رأينا.</p>${TASK('اضغط على كل جزء ملون عشان تعرف دوره', 5)}
  ${RL.map((s, i) => `<div class="row">${s.map((x, j) => `<span class="chip ${x[2]}" data-k="${i}-${j}" data-r="${x[1]}" style="cursor:pointer">${x[0]}</span>`).join('')}</div>`).join('')}<div class="msg" id="m">👆 اضغط على جزء</div>`;
  document.querySelectorAll('[data-r]').forEach(c => c.onclick = () => { say(c.dataset.r); beep(1); c.style.boxShadow = '0 0 16px rgba(255,255,255,.4)'; seen.add(c.dataset.k); pg(seen.size, 5); if (seen.size == 5) ok(); });
}

const AD = [['He was ill, but he went to school.', 'الجملة الأصلية بـ <code>but</code>'], ['<em>However ill</em> he was, he went to school.', '<code>However</code> + الصفة + الفاعل + الفعل (من غير <code>but</code>)'], ['<em>However hard</em> he tried, he failed.', 'نفس الشكل مع أي صفة أو ظرف'], ['<em>Whatever</em> you do, I won\'t punish you.', 'وكمان <code>Whatever</code> + جملة = مهما فعلت']];
function sAdj() {
  let i = 0;
  const draw = () => {
    $('#scene').innerHTML = `<h2>However / Whatever 🪄</h2>${TASK('اضغط "حوّل" وشوف الجملة بتتحول لإيه', AD.length)}
    <div class="chip big shake" style="display:block;text-align:left">${AD[i][0]}</div><div class="msg" style="color:var(--a)">${AD[i][1]}</div>
    <button class="btn" id="tr" style="display:block;margin:12px auto" ${i == AD.length - 1 ? 'disabled' : ''}>حوّل 🪄</button>`;
    pg(i + 1, AD.length); $('#tr').onclick = () => { i++; beep(1); draw(); }; if (i == AD.length - 1) ok();
  };
  draw();
}

const FL = [
  ['While it is true that', 'في حين أنه صحيح أن', 'While it is true that money is important, it cannot buy happiness.'],
  ['Whereas', 'بينما / في حين أن', 'My brother likes sports, whereas I prefer reading.'],
  ['Whatever + noun + subj + verb', 'مهما / أيا كان', 'Whatever his mistakes, I will forgive him.'],
  ['Admittedly', 'حقيقةً.. / بالاعتراف', 'Admittedly, the exam was difficult; however, everyone passed.'],
  ['On the other hand', 'من ناحية أخرى', 'Living in cities is exciting. On the other hand, it is very noisy.'],
  ['Nevertheless', 'ومع ذلك', 'She was afraid; nevertheless, she entered the dark room.']
];
function sFlip() {
  const seen = new Set();
  $('#scene').innerHTML = `<h2>كروت الروابط 🃏</h2>${TASK('اضغط على كل كارت عشان يتقلب ويوريك المعنى والمثال', FL.length)}<div class="grid">${FL.map((f, i) => `<div class="flip" data-i="${i}"><div class="in"><div class="f"><span class="en">${f[0]}</span></div><div class="b">${f[1]}<small class="en">${f[2]}</small></div></div></div>`).join('')}</div>`;
  document.querySelectorAll('.flip').forEach(c => c.onclick = () => { c.classList.toggle('on'); beep(1); seen.add(c.dataset.i); pg(seen.size, FL.length); if (seen.size == FL.length) ok(); });
}

const TB = [['Although / Even though + clause', 'على الرغم من أن'], ['Despite / In spite of + noun / v-ing', 'على الرغم من'], ['While it is true that', 'في حين أنه صحيح أن'], ['It may be argued that', 'ممكن يُقال إن'], ['Admittedly', 'حقيقةً.. / بالاعتراف'], ['Nevertheless', 'ومع ذلك'], ['however', 'ولكن / مهما (حسب مكانها)'], ['but', 'لكن'], ['On the other hand', 'من ناحية أخرى'], ['Whereas', 'بينما / في حين أن'], ['Whatever + noun + subj + verb', 'مهما / أيا كان']];
function sTable() {
  $('#scene').innerHTML = `<h2>ملخص القاعدة 📋</h2>${TASK('راجع الجدول، وبعدين اضغط التالي لآخر تمرين')}${TB.map(r => `<div class="r2 good"><b class="en">${r[0]}</b><small>${r[1]}</small></div>`).join('')}`;
  ok();
}

const PZ = ['Although it was raining, we went for a walk.', 'Despite the cold weather, she wore a T-shirt.', 'He is rich, but he is not happy.'];
function sBuild() {
  let p = 0;
  const draw = () => {
    const t = PZ[p], all = sh(t.split(' ').map((w, i) => ({ w, i }))), ans = [];
    $('#scene').innerHTML = `<h2>جرّب بنفسك ✍️</h2>${TASK('اضغط على الكلمات بالترتيب الصح (واضغط عليها فوق لو عايز ترجعها)، وبعدين اضغط "تأكد"', PZ.length)}
    <div class="row" id="an" style="min-height:52px;border-bottom:2px dashed rgba(255,255,255,.2)"></div><div class="row" id="pl"></div>
    <div class="bar"><button class="btn" id="ck" disabled>تأكد ✔</button></div><div class="msg" id="m"></div>`;
    pg(p, PZ.length);
    const r = () => {
      $('#an').innerHTML = ans.map((x, k) => `<button class="pill on" data-k="${k}">${x.w}</button>`).join('');
      $('#pl').innerHTML = all.filter(x => !ans.includes(x)).map(x => `<button class="pill" data-i="${x.i}">${x.w}</button>`).join('');
      $('#ck').disabled = ans.length != all.length;
      $('#an').querySelectorAll('.pill').forEach(b => b.onclick = () => { ans.splice(+b.dataset.k, 1); r(); });
      $('#pl').querySelectorAll('.pill').forEach(b => b.onclick = () => { ans.push(all.find(x => x.i == b.dataset.i)); r(); });
    };
    r();
    $('#ck').onclick = () => {
      if (ans.map(x => x.w).join(' ') == t) {
        beep(1); say('🔥 جملة ممتازة!'); $('#ck').disabled = true; p++; pg(p, PZ.length);
        setTimeout(() => p < PZ.length ? draw() : (ok(), $('#scene').innerHTML = '<h2>🏅 خلصت الشرح!</h2><p>دلوقتي جاهز تختبر نفسك في الأسئلة.</p>'), 1400);
      } else { beep(0); say('❌ مش مظبوطة، رتّب تاني', 'var(--r)'); $('#an').classList.add('shake'); setTimeout(() => $('#an').classList.remove('shake'), 400); }
    };
  };
  draw();
}


/* ==========================================
   2) الأسئلة والاختبارات (Quizzes) - أصبح القسم الثاني
   ========================================== */
function quizIntro() {
  const L = [['سهل 🟢', 1], ['متوسط 🟡', 2], ['صعب 🔴', 3]];
  const on = new Set([1, 2, 3]);

  app.innerHTML = `
    <section class="card">
      <h2>الأسئلة (اختياري)</h2>
      <p>اختار المستويات اللي عايز تحلها. هتيجي من الأسهل للأصعب.</p>
      <div class="pills">${L.map(l => `<button class="pill on" data-l="${l[1]}">${l[0]} (${QS.filter(q => q.l == l[1]).length})</button>`).join('')}</div>
      <div class="bar">
        <button class="btn ghost" id="sk">تخطي الأسئلة</button>
        <button class="btn" id="st">يلا نبدأ ▶</button>
      </div>
    </section>
  `;

  document.querySelectorAll('.pill').forEach(b => b.onclick = () => {
    const l = +b.dataset.l;
    on.has(l) ? on.delete(l) : on.add(l);
    b.classList.toggle('on');
  });

  // تخطي قسم الأسئلة كلياً والانتقال للكلمات
  $('#sk').onclick = () => { S.ql = []; S.qr = []; go(2); };
  $('#st').onclick = () => {
    S.ql = QS.filter(q => on.has(q.l)).sort((a, b) => a.l - b.l);
    S.qi = 0;
    S.qr = [];
    S.ql.length ? qq() : go(2);
  };
}

const TL = { mcq: 'اختار الإجابة الصح', sent: 'اختار الجملة الصح', en2ar: 'ترجم للعربي', ar2en: 'ترجم للإنجليزي' };

function qq() {
  const q = S.ql[S.qi];
  const ar = q.t == 'en2ar';
  const last = S.qi == S.ql.length - 1;
  const opts = sh(q.o.map((t, i) => ({ t, c: !i })));

  app.innerHTML = `
    <section class="card">
      <div class="meta">
        <span class="lv l${q.l}">${['', 'سهل', 'متوسط', 'صعب'][q.l]}</span>
        <span>${S.qi + 1}/${S.ql.length}</span>
      </div>
      <p class="tl">${TL[q.t]}</p>
      ${q.q ? `<div class="q ${q.t == 'ar2en' ? '' : 'en'}">${q.q}</div>` : ''}
      <div class="opts">${opts.map(o => `
        <button class="opt ${ar ? '' : 'en'}">
          ${o.t}${o.c ? `<i class="tip">💡 ${q.why}</i>` : ''}
        </button>
      `).join('')}</div>
      <div class="msg" id="m"></div>
      <div class="bar">
        <button class="btn ghost" id="qsk">Skip ⏭</button>
        <button class="btn" id="qn" hidden></button>
      </div>
    </section>
  `;

  // زر Skip للسؤال الحالي (ينقص الدرجة)
  $('#qsk').onclick = () => {
    beep(0);
    S.qr.push({ q: q.q, ok: false, mine: 'تخطي (Skip)', right: q.o[0], why: q.why });
    S.qi++;
    last ? go(2) : qq();
  };

  const bs = document.querySelectorAll('.opt');
  bs.forEach((b, i) => b.onclick = () => {
    $('#qsk').hidden = true; // إخفاء Skip بعد اختيار إجابة
    const o = opts[i];
    bs.forEach((x, j) => {
      x.disabled = true;
      if (opts[j].c) x.classList.add('good', 'show');
    });
    if (!o.c) b.classList.add('bad');
    beep(o.c);

    $('#m').style.color = o.c ? 'var(--g)' : 'var(--r)';
    $('#m').textContent = o.c ? '✅ صح! جامد 🔥' : '❌ غلط — الإجابة الصح اتعلّمت لك 👇';

    S.qr.push({ q: q.q, ok: o.c, mine: o.t, right: q.o[0], why: q.why });
    const n = $('#qn');
    n.hidden = false;
    n.textContent = last ? 'للكلمات ▶' : 'التالي ▶';
    n.onclick = () => {
      S.qi++;
      last ? go(2) : qq();
    };
  });
}


/* ==========================================
   3) تسميع الكلمات (Vocabulary Testing) - أصبح القسم الثالث
   ========================================== */
function words() {
  S.wl = sh(WORDS).slice(0, 10);
  S.wi = 0;
  S.wr = [];
  wq();
}

const nz = (s) => s.normalize('NFKC').toLowerCase().replace(/[^a-z]/g, '');

function wq() {
  const [w, ar, syn = []] = S.wl[S.wi];
  const last = S.wi == S.wl.length - 1;
  let fail = false;

  app.innerHTML = `
    <section class="card">
      <div class="meta"><span>الكلمات</span><span>${S.wi + 1}/${S.wl.length}</span></div>
      <p>اكتب الكلمة بالإنجليزي: <small>(لو كتبت مرادف صح بتاخد نص درجة)</small></p>
      <div style="text-align:center"><div class="chip big">${ar}</div></div>
      <input id="wi" class="inp en" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type here...">
      <div class="msg" id="m"></div>
      <div class="bar">
        <button class="btn ghost" id="wsk">Skip ⏭</button>
        <button class="btn" id="wc">تأكد ✔</button>
      </div>
    </section>
  `;

  const inp = $('#wi'), m = $('#m'), b = $('#wc'), skBtn = $('#wsk');
  inp.focus();

  skBtn.onclick = () => {
    beep(0);
    S.wr[S.wi] = { w, ar, pts: 0 };
    S.wi++;
    last ? go(3) : wq();
  };

  const fin = (pts, msg) => {
    S.wr[S.wi] = { w, ar, pts, typed: inp.value.trim() };
    inp.disabled = true;
    skBtn.hidden = true;
    inp.classList.add('good');
    m.style.color = 'var(--g)';
    m.innerHTML = msg;
    b.textContent = last ? 'النتيجة 🏆' : 'Next ▶';
    b.onclick = () => { S.wi++; last ? go(3) : wq(); };
  };

  const chk = () => {
    if (inp.disabled) return;
    const raw = inp.value.trim(), v = nz(raw);
    if (!raw) return;
    if (!v) { m.style.color = 'var(--a)'; m.textContent = 'اكتب بالإنجليزي 🙂'; return; }

    if (v === nz(w)) {
      beep(1);
      fin(fail ? 0 : 1, '✅ <b class="en">Correct!</b>');
    } else if (syn.some(x => nz(x) === v)) {
      beep(1);
      fin(fail ? 0 : .5, `🟡 نفس المعنى! ${fail ? '' : '(نص درجة) '}الكلمة المطلوبة: <b class="en">${w}</b>`);
    } else {
      beep(0);
      fail = true;
      inp.disabled = true;
      inp.classList.add('bad');
      m.style.color = 'var(--r)';
      m.innerHTML = `❌ الكلمة الصح: <b class="en">${w}</b>`;
      setTimeout(() => {
        inp.disabled = false;
        inp.value = '';
        inp.className = 'inp en';
        m.style.color = 'var(--a)';
        m.textContent = 'جرب تاني 💪';
        inp.focus();
      }, 2200);
    }
  };

  b.onclick = chk;
  inp.onkeydown = (e) => { if (e.key == 'Enter') b.onclick(); };
}


/* ==========================================
   4) النتيجة النهائية (Results)
   ========================================== */
function result() {
  const q = S.qr, w = S.wr;
  const qo = q.filter(x => x.ok).length;
  const wo = w.reduce((t, x) => t + x.pts, 0);

  app.innerHTML = `
    <section class="card">
      <h2>🏆 النتيجة النهائية</h2>
      <div class="score">
        <div><b>${qo}/${q.length ? q.length : '—'}</b>الأسئلة</div>
        <div><b>${Number.isInteger(wo) ? wo : wo.toFixed(1)}/${w.length}</b>الكلمات</div>
      </div>
 
      <h3>الأسئلة</h3>
      ${q.length ? q.map(x => `
        <div class="r2 ${x.ok ? 'good' : 'bad'}">
          ${x.ok ? '✅' : '❌'} ${x.q ? `<bdi>${x.q}</bdi><br>` : ''}
          <small>إجابتك: <bdi>${x.mine}</bdi></small>
          ${x.ok ? '' : `<small>الصح: <bdi>${x.right}</bdi></small>`}
          <small>💡 ${x.why}</small>
        </div>
      `).join('') : '<p>اخترت تتخطى الأسئلة.</p>'}
 
      <h3>الكلمات</h3>
      ${w.map(x => `
        <div class="r2 ${x.pts == 1 ? 'good' : x.pts ? 'half' : 'bad'}">
          ${x.pts == 1 ? '✅' : x.pts ? '🟡' : '❌'} <b class="en">${x.w}</b> — ${x.ar}${x.pts == .5 ? `<small>كتبت <bdi>${x.typed}</bdi> (نفس المعنى، نص درجة)</small>` : x.pts ? '' : '<small>غلطت فيها أو عملت Skip</small>'}
        </div>
      `).join('')}
 
      <div class="bar"><button class="btn" onclick="location.reload()">🔄 ابدأ من الأول</button></div>
    </section>
  `;
  confetti();
}

// بدء التشغيل
go(0);

// Auto Update Copyright Year
const yearSpan = document.querySelector("#currentYear");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}