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

const NAMES = ['الشرح', 'الكلمات', 'الأسئلة', 'النتيجة'];

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

// التنقل بين الأقسام الرئيسية
function go(i) {
  S.sec = i;
  nav();
  [learn, words, quizIntro, result][i]();
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

function learn() {
  S.sc = 0;
  app.innerHTML = `
    <section class="card">
      <div class="dots" id="dots"></div>
      <div id="scene"></div>
      <div class="bar"><button class="btn" id="nx"></button></div>
    </section>
  `;
  scene();
}

function scene() {
  $('#dots').innerHTML = SC.map((_, i) => `<i class="${i <= S.sc ? 'on' : ''}"></i>`).join('');
  const n = $('#nx'), last = S.sc == SC.length - 1;
  n.disabled = true;
  n.classList.remove('pulse');
  n.textContent = last ? 'يلا للكلمات 🚀' : 'التالي ◀';
  n.onclick = () => last ? go(1) : (S.sc++, scene());
  SC[S.sc]();
}

const SC = [sBut, sGate, sHow, sFlip, sBuild];

function sBut() {
  $('#scene').innerHTML = `
    <h2>الجسر <code>but</code> 🌉</h2>
    <p>جملتين عكس بعض، و <code>but</code> هي الجسر اللي بيوصلهم. اضغط عليها!</p>
    <div class="row">
      <div class="chip a">He is rich</div>
      <div class="gap" id="gap">?</div>
      <div class="chip b">he is not happy</div>
    </div>
    <button class="word" id="bt">but</button>
    <div class="msg" id="m"></div>
  `;
  $('#bt').onclick = () => {
    const g = $('#gap');
    g.innerHTML = ', but';
    g.classList.add('filled');
    $('#bt').remove();
    $('#m').innerHTML = '✅ الفاصلة <code>,</code> بتيجي <b>قبل</b> <code>but</code>، وبعدها جملة كاملة، ومعناها: <b>لكن</b>. غنى ⚖️ حزن';
    beep(1);
    ok();
  };
}

const GR = [
  { f: 'it was raining', c: 0, full: '<em>Although</em> it was raining, we went for a walk.', h: 'فيها فاعل وفعل = Clause' },
  { f: 'the cold weather', c: 1, full: '<em>Despite</em> the cold weather, she wore a T-shirt.', h: 'اسم من غير فعل = Phrase' },
  { f: 'he was very tired', c: 0, full: '<em>Even though</em> he was very tired, he finished the work.', h: 'فيها فاعل وفعل = Clause' },
  { f: 'being tired', c: 1, full: '<em>In spite of</em> being tired, he finished the work.', h: 'v-ing = Phrase' }
];

function sGate() {
  let i = 0;
  const draw = () => {
    const r = GR[i];
    $('#scene').innerHTML = `
      <h2>بوابتين: Clause و Phrase 🚪</h2>
      <p><code>Clause</code> = جملة كاملة (فاعل + فعل) ← مع <code>Although</code> و <code>Even though</code>.<br><code>Phrase</code> = اسم أو <code>v-ing</code> ← مع <code>Despite</code> و <code>In spite of</code>.</p>
      <div style="text-align:center"><div class="chip big" id="cd">${r.f}</div></div>
      <div class="pills">
        <button class="pill" data-c="0">Although / Even though</button>
        <button class="pill" data-c="1">Despite / In spite of</button>
      </div>
      <div class="msg" id="m"></div>
    `;
    document.querySelectorAll('.pill').forEach(b => b.onclick = () => {
      if (+b.dataset.c == r.c) {
        beep(1);
        $('#m').innerHTML = '✅ ' + r.full;
        document.querySelectorAll('.pill').forEach(x => x.disabled = true);
        i++;
        setTimeout(() => i < GR.length ? draw() : (ok(), $('#m').innerHTML = '🎉 خلصت البوابات! كل جملة كاملة محتاجة بوابتها.'), 1900);
      } else {
        beep(0);
        $('#cd').classList.add('shake');
        setTimeout(() => $('#cd').classList.remove('shake'), 400);
        $('#m').style.color = 'var(--r)';
        $('#m').textContent = '❌ جرب تاني — ' + r.h;
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
  $('#scene').innerHTML = `
    <h2>الرابط بيتنقل 🧩</h2>
    <p>جرّب الطرق التلاتة وشوف علامات الترقيم بتتغير إزاي:</p>
    <div class="pills">${HW.map((h, i) => `<button class="pill" data-i="${i}">${h[0]}</button>`).join('')}</div>
    <div style="text-align:center"><div class="chip big" id="hs">He was ill ... he went to school</div></div>
    <div class="msg" id="m"></div>
  `;
  document.querySelectorAll('.pill').forEach(b => b.onclick = () => {
    const h = HW[b.dataset.i];
    document.querySelectorAll('.pill').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    $('#hs').innerHTML = h[1];
    $('#hs').classList.remove('shake');
    void $('#hs').offsetWidth;
    $('#hs').classList.add('shake');
    $('#m').style.color = 'var(--g)';
    $('#m').textContent = h[2];
    seen.add(b.dataset.i);
    if (seen.size == 3) ok();
  });
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
  $('#scene').innerHTML = `
    <h2>كروت الروابط 🃏</h2>
    <p>اضغط على كل كارت عشان يتقلب ويوريك المعنى والمثال.</p>
    <div class="grid">${FL.map((f, i) => `
      <div class="flip" data-i="${i}">
        <div class="in">
          <div class="f"><span class="en">${f[0]}</span></div>
          <div class="b">${f[1]}<small class="en">${f[2]}</small></div>
        </div>
      </div>
    `).join('')}</div>
  `;
  document.querySelectorAll('.flip').forEach(c => c.onclick = () => {
    c.classList.toggle('on');
    beep(1);
    seen.add(c.dataset.i);
    if (seen.size == FL.length) ok();
  });
}

const PZ = [
  'Although it was raining, we went for a walk.',
  'Despite the cold weather, she wore a T-shirt.',
  'He is rich, but he is not happy.'
];

function sBuild() {
  let p = 0;
  const draw = () => {
    const t = PZ[p], all = sh(t.split(' ').map((w, i) => ({ w, i }))), ans = [];
    $('#scene').innerHTML = `
      <h2>جرّب بنفسك ✍️ (${p + 1}/${PZ.length})</h2>
      <p>رتّب الكلمات عشان تكوّن جملة صح. اضغط على الكلمة عشان تنزل وتطلع.</p>
      <div class="row" id="an" style="min-height:52px;border-bottom:2px dashed #ffffff44"></div>
      <div class="row" id="pl"></div>
      <div class="bar"><button class="btn" id="ck" disabled>تأكد ✔</button></div>
      <div class="msg" id="m"></div>
    `;

    const r = () => {
      $('#an').innerHTML = ans.map((item, k) => `<button class="pill on" data-k="${k}">${item.w}</button>`).join('');
      $('#pl').innerHTML = all.filter(item => !ans.includes(item)).map(item => `<button class="pill" data-i="${item.i}">${item.w}</button>`).join('');
      $('#ck').disabled = ans.length != all.length;

      $('#an').querySelectorAll('.pill').forEach(b => b.onclick = () => {
        ans.splice(+b.dataset.k, 1);
        r();
      });
      $('#pl').querySelectorAll('.pill').forEach(b => b.onclick = () => {
        ans.push(all.find(item => item.i == b.dataset.i));
        r();
      });
    };
    r();

    $('#ck').onclick = () => {
      if (ans.map(item => item.w).join(' ') == t) {
        beep(1);
        $('#m').style.color = 'var(--g)';
        $('#m').textContent = '🔥 جملة ممتازة!';
        $('#ck').disabled = true;
        p++;
        setTimeout(() => p < PZ.length ? draw() : (ok(), $('#scene').innerHTML = '<h2>🏅 خلصت الشرح!</h2><p>دلوقتي جاهز تختبر نفسك في الكلمات.</p>'), 1400);
      } else {
        beep(0);
        $('#m').style.color = 'var(--r)';
        $('#m').textContent = '❌ مش مظبوطة، رتّب تاني';
        $('#an').classList.add('shake');
        setTimeout(() => $('#an').classList.remove('shake'), 400);
      }
    };
  };
  draw();
}


/* ==========================================
   2) تسميع الكلمات (Vocabulary Testing)
   ========================================== */
function words() {
  S.wl = sh(WORDS).slice(0, 10);
  S.wi = 0;
  S.wr = [];
  wq();
}

function wq() {
  const [w, ar] = S.wl[S.wi];
  const last = S.wi == S.wl.length - 1;
  let fail = false;

  app.innerHTML = `
    <section class="card">
      <div class="meta"><span>الكلمات</span><span>${S.wi + 1}/${S.wl.length}</span></div>
      <p>اكتب الكلمة بالإنجليزي:</p>
      <div style="text-align:center"><div class="chip big">${ar}</div></div>
      <input id="wi" class="inp en" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type here...">
      <div class="msg" id="m"></div>
      <div class="bar"><button class="btn" id="wc">تأكد ✔</button></div>
    </section>
  `;

  const inp = $('#wi'), m = $('#m'), b = $('#wc');
  inp.focus();

  const chk = () => {
    const v = inp.value.trim();
    if (!v || inp.disabled) return;

    if (v.toLowerCase() === w.toLowerCase()) {
      beep(1);
      S.wr[S.wi] = { w, ar, ok: !fail };
      inp.disabled = true;
      inp.classList.add('good');
      m.style.color = 'var(--g)';
      m.innerHTML = '✅ <b class="en">Correct!</b>';
      b.textContent = last ? 'للأسئلة ▶' : 'Next ▶';
      b.onclick = () => {
        S.wi++;
        last ? go(2) : wq();
      };
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
   3) الأسئلة والاختبارات (Quizzes)
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

  $('#sk').onclick = () => { S.ql = []; S.qr = []; go(3); };
  $('#st').onclick = () => {
    S.ql = QS.filter(q => on.has(q.l)).sort((a, b) => a.l - b.l);
    S.qi = 0;
    S.qr = [];
    S.ql.length ? qq() : go(3);
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
      <div class="bar"><button class="btn" id="qn" hidden></button></div>
    </section>
  `;

  const bs = document.querySelectorAll('.opt');
  bs.forEach((b, i) => b.onclick = () => {
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
    n.textContent = last ? 'النتيجة 🏆' : 'التالي ▶';
    n.onclick = () => {
      S.qi++;
      last ? go(3) : qq();
    };
  });
}


/* ==========================================
   4) النتيجة النهائية (Results)
   ========================================== */
function result() {
  const q = S.qr, w = S.wr;
  const qo = q.filter(x => x.ok).length;
  const wo = w.filter(x => x.ok).length;

  app.innerHTML = `
    <section class="card">
      <h2>🏆 النتيجة النهائية</h2>
      <div class="score">
        <div><b>${wo}/${w.length}</b>الكلمات</div>
        <div><b>${q.length ? qo + '/' + q.length : '—'}</b>الأسئلة</div>
      </div>

      <h3>الكلمات</h3>
      ${w.map(x => `
        <div class="r2 ${x.ok ? 'good' : 'bad'}">
          ${x.ok ? '✅' : '❌'} <b class="en">${x.w}</b> — ${x.ar}${x.ok ? '' : '<small>غلطت فيها قبل ما تصحح</small>'}
        </div>
      `).join('')}

      <h3>الأسئلة</h3>
      ${q.length ? q.map(x => `
        <div class="r2 ${x.ok ? 'good' : 'bad'}">
          ${x.ok ? '✅' : '❌'} ${x.q ? `<bdi>${x.q}</bdi><br>` : ''}
          <small>إجابتك: <bdi>${x.mine}</bdi></small>
          ${x.ok ? '' : `<small>الصح: <bdi>${x.right}</bdi></small>`}
          <small>💡 ${x.why}</small>
        </div>
      `).join('') : '<p>اخترت تتخطى الأسئلة.</p>'}

      <div class="bar"><button class="btn" onclick="location.reload()">🔄 ابدأ من الأول</button></div>
    </section>
  `;
  confetti();
}

// بدء التشغيل
go(0);