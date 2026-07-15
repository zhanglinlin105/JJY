const works = [
  {
    year: "2018",
    kind: "电视剧",
    title: "芸汐传",
    role: "韩芸汐",
    note: "从偶像舞台走向古装大女主的重要节点，也以《叹云兮》延展了角色的音乐记忆。",
    source: "https://www.iq.com/album/19rxrvzovg",
    tone: "wine",
  },
  {
    year: "2019",
    kind: "电视剧",
    title: "新白娘子传奇",
    role: "白素贞",
    note: "以新一代视角重新演绎经典白蛇故事，在古典气质与当代表达之间寻找平衡。",
    source: "https://www.iqiyi.com/common/20190403/e37fdd55a52b7782.html",
    tone: "ink",
  },
  {
    year: "2019",
    kind: "音乐单曲",
    title: "恋爱告急",
    role: "演唱",
    note: "轻快明亮的个人单曲，成为她离开团体舞台之后极具辨识度的流行音乐作品。",
    source: "https://music.apple.com/jp/song/1703179307",
    tone: "silver",
  },
  {
    year: "2023",
    kind: "电视剧",
    title: "花戎",
    role: "魏枝 / 司马忘月 / 魔后",
    note: "在仙侠叙事中呈现多重人物状态，让角色的成长、选择与宿命彼此映照。",
    source: "https://www.iqiyi.com/a_188g3fn6fl1.html",
    tone: "plum",
  },
  {
    year: "2024",
    kind: "电视剧",
    title: "仙剑四",
    role: "韩菱纱",
    note: "饰演机敏灵动的韩菱纱，并演唱角色主题曲《如纱》。",
    source: "https://www.iqiyi.com/a_dwo684rau1.html",
    tone: "sage",
  },
  {
    year: "2024",
    kind: "电视剧",
    title: "花间令",
    role: "杨采薇 / 上官芷",
    note: "古装、爱情与探案交织的作品，以双重身份带出人物关系的悬念。",
    source: "https://m.bjnews.com.cn/detail/1710471421129441.html",
    tone: "blue",
  },
  {
    year: "2026",
    kind: "电视剧",
    title: "月鳞绮纪",
    role: "露芜衣",
    note: "饰演九尾狐露芜衣，于 2026 年 4 月上线，是她最新的荧幕章节。",
    source: "https://www.youku.tv/v/v_show/id_XNjUyMzQwNTQ4NA%3D%3D.html?s=ddad446e1d6645cdb814",
    tone: "night",
  },
];

const timeline = [
  {
    year: "1994",
    title: "生于四川遂宁",
    text: "6 月 18 日出生。舞蹈、小提琴与舞台训练，构成她日后演员与歌手双线发展的起点。",
  },
  {
    year: "2013",
    title: "剧场初见",
    text: "作为 SNH48 二期生，以《剧场女神》公演正式出道，从小剧场开始积累舞台经验。",
  },
  {
    year: "2014—17",
    title: "四次总选，两度登顶",
    text: "四届年度总选举排名依次为第 4、第 2、第 1、第 1；2017 年晋升明星殿堂。",
  },
  {
    year: "2016",
    title: "从舞台走向镜头",
    text: "出演《九州·天空城》中的雪飞霜，并推出首张个人 EP《每一天》，开启个人作品线。",
  },
  {
    year: "2017",
    title: "成立个人工作室",
    text: "12 月 15 日起以个人艺人身份继续发展，表演与音乐成为并行的两条创作路径。",
  },
  {
    year: "2018—24",
    title: "角色不断生长",
    text: "从韩芸汐、白素贞到韩菱纱与上官芷，在古装、仙侠与探案叙事中建立荧幕辨识度。",
  },
  {
    year: "2026",
    title: "新的荧幕章节",
    text: "《月鳞绮纪》上线，饰演九尾狐露芜衣；表演与音乐仍在持续交汇。",
  },
];

const gallery = [
  {
    src: "/images/ju-birthday-2021.jpg",
    alt: "鞠婧祎身着礼服坐在书房沙发上阅读",
    caption: "书房肖像 · 2021",
    file: "https://commons.wikimedia.org/wiki/File:Ju_Jing_Yi_27th.jpg",
    className: "galleryLead",
  },
  {
    src: "/images/ju-portrait-02.jpg",
    alt: "鞠婧祎在舞台上手持麦克风微笑",
    caption: "舞台时刻 · 2017",
    file: "https://commons.wikimedia.org/wiki/File:%E9%9E%A0%E5%A9%A7%E7%A5%8E_(2).jpg",
    className: "galleryTall",
  },
  {
    src: "/images/ju-portrait-04.jpg",
    alt: "鞠婧祎在舞台灯光下的半身肖像",
    caption: "聚光灯下 · 2017",
    file: "https://commons.wikimedia.org/wiki/File:%E9%9E%A0%E5%A9%A7%E7%A5%8E_(4).jpg",
    className: "galleryPortrait",
  },
  {
    src: "/images/ju-election-2015.jpg",
    alt: "鞠婧祎与 SNH48 成员在舞台上演出",
    caption: "SNH48 舞台 · 2015",
    file: "https://commons.wikimedia.org/wiki/File:SNH48_%E7%AC%AC%E4%BA%8C%E5%B1%8A%E6%80%BB%E9%80%89%E4%B8%BE_10.jpg",
    className: "galleryWide",
  },
  {
    src: "/images/ju-portrait-03.jpg",
    alt: "鞠婧祎身着黄色舞台服装的全身照",
    caption: "舞台造型 · 2017",
    file: "https://commons.wikimedia.org/wiki/File:%E9%9E%A0%E5%A9%A7%E7%A5%8E_(3).jpg",
    className: "galleryPortrait galleryCropLow",
  },
  {
    src: "/images/ju-portrait-05.jpg",
    alt: "鞠婧祎在紫色舞台灯光中的近景肖像",
    caption: "光影近景 · 2017",
    file: "https://commons.wikimedia.org/wiki/File:%E9%9E%A0%E5%A9%A7%E7%A5%8E_(5).jpg",
    className: "gallerySquare",
  },
];

const sources = [
  ["SNH48 官方履历", "https://www.snh48.com/html/snh/allnews/zixun/201712/4355.html"],
  ["Apple Music 艺人页", "https://music.apple.com/us/artist/%E9%9E%A0%E5%A9%A7%E7%A5%8E/1252617058?l=zh-Hans-CN"],
  ["1905 电影网人物资料", "https://m.1905.com/m/star/3157585/"],
  ["iQIYI 演员资料", "https://www.iq.com/actor-info/ju-jing-yi-cecily-kiku-223740805?lang=zh_cn"],
];

export default function Home() {
  return (
    <>
      <a className="skipLink" href="#main-content">
        跳到主要内容
      </a>

      <header className="siteHeader">
        <a className="wordmark" href="#top" aria-label="返回首页">
          <span>JU</span> JINGYI
        </a>
        <nav className="desktopNav" aria-label="主要导航">
          <a href="#works">代表作</a>
          <a href="#journey">经历</a>
          <a href="#gallery">影像</a>
          <a href="#about">关于</a>
        </nav>
        <details className="mobileNav">
          <summary aria-label="打开导航菜单">
            <span />
            <span />
          </summary>
          <nav aria-label="移动端导航">
            <a href="#works">代表作</a>
            <a href="#journey">经历</a>
            <a href="#gallery">影像</a>
            <a href="#about">关于</a>
          </nav>
        </details>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="heroImageWrap" aria-hidden="true">
            <img
              className="heroImage"
              src="/images/ju-birthday-2021.jpg"
              alt=""
              fetchPriority="high"
            />
          </div>
          <div className="heroWash" />
          <div className="heroGrid">
            <p className="eyebrow heroEyebrow">ACTRESS · SINGER / 1994—PRESENT</p>
            <h1 id="hero-title">
              <span>鞠</span>
              <span>婧祎</span>
            </h1>
            <p className="heroIntro">
              从剧场舞台到荧幕叙事，
              <br />
              在表演与音乐之间，持续书写自己的章节。
            </p>
            <div className="heroActions">
              <a className="primaryButton" href="#works">
                探索代表作 <span aria-hidden="true">↘</span>
              </a>
              <a className="textLink" href="#journey">
                了解她的旅程
              </a>
            </div>
            <div className="heroIndex" aria-hidden="true">
              <span>01</span>
              <i />
              <span>SCROLL</span>
            </div>
            <p className="heroCredit">
              Photo: Camellia234 / CC BY-SA 4.0 · 已裁剪
            </p>
          </div>
        </section>

        <section className="introStatement" aria-label="人物简介">
          <p className="eyebrow">A PORTRAIT IN MOTION</p>
          <div className="introStatementGrid">
            <p className="introLead">
              她的故事，始于一方剧场；
              <br />
              也在每一次镜头亮起时重新开始。
            </p>
            <p className="introCopy">
              鞠婧祎，1994 年 6 月 18 日出生于四川遂宁，中国内地演员、歌手。
              2013 年正式出道，职业路径横跨偶像舞台、流行音乐与古装影视。
              她以克制而清晰的个人风格，完成从团体成员到个人艺人的转身。
            </p>
          </div>
        </section>

        <section className="worksSection" id="works" aria-labelledby="works-title">
          <div className="sectionHeading">
            <div>
              <p className="eyebrow">SELECTED WORKS / 代表作</p>
              <h2 id="works-title">银幕与舞台</h2>
            </div>
            <p>
              七部作品，串联演员与歌手两种身份。
              <br />
              年份与角色信息均来自公开资料。
            </p>
          </div>

          <div className="worksList">
            {works.map((work, index) => (
              <article className="workCard" key={work.title}>
                <div className={`workArt workArt--${work.tone}`} aria-hidden="true">
                  <span className="workNumber">{String(index + 1).padStart(2, "0")}</span>
                  <span className="workArtTitle">{work.title}</span>
                  <span className="workArtYear">{work.year}</span>
                </div>
                <div className="workInfo">
                  <p className="workMeta">
                    {work.year} <span /> {work.kind}
                  </p>
                  <h3>{work.title}</h3>
                  <p className="workRole">
                    {work.kind === "音乐单曲" ? work.role : `饰 / ${work.role}`}
                  </p>
                  <p className="workNote">{work.note}</p>
                  <a href={work.source} target="_blank" rel="noreferrer">
                    查看资料来源 <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="timelineSection" id="journey" aria-labelledby="journey-title">
          <div className="timelineIntro">
            <p className="eyebrow">CAREER JOURNEY / 生平经历</p>
            <h2 id="journey-title">时间留下的<br />每一束光</h2>
            <p>
              十余年的职业轨迹，不只由一个角色或一首歌定义。
              舞台经验、镜头表演与个人选择，共同构成她的成长线。
            </p>
          </div>
          <ol className="timeline">
            {timeline.map((item, index) => (
              <li key={item.year + item.title}>
                <span className="timelineDot" aria-hidden="true" />
                <p className="timelineYear">{item.year}</p>
                <div>
                  <p className="timelineNumber">{String(index + 1).padStart(2, "0")}</p>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="gallerySection" id="gallery" aria-labelledby="gallery-title">
          <div className="sectionHeading galleryHeading">
            <div>
              <p className="eyebrow">PORTRAITS & MOMENTS / 影像</p>
              <h2 id="gallery-title">光影切片</h2>
            </div>
            <p>舞台、镜头与安静片刻，构成人物更完整的侧面。</p>
          </div>
          <div className="galleryGrid">
            {gallery.map((image) => (
              <figure className={image.className} key={image.src}>
                <div className="galleryImageWrap">
                  <img src={image.src} alt={image.alt} loading="lazy" />
                </div>
                <figcaption>
                  <span>{image.caption}</span>
                  <a href={image.file} target="_blank" rel="noreferrer">
                    来源 ↗
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="aboutSection" id="about" aria-labelledby="about-title">
          <div className="aboutPortrait">
            <img
              src="/images/ju-portrait-02.jpg"
              alt="鞠婧祎在舞台上手持麦克风微笑"
              loading="lazy"
            />
            <p>舞台肖像 · 2017</p>
          </div>
          <div className="aboutContent">
            <p className="eyebrow">BEYOND THE FRAME / 关于</p>
            <h2 id="about-title">角色之外，<br />仍然是创作者。</h2>
            <p className="aboutLead">
              从群像里的一个位置，到拥有自己的姓名与表达，鞠婧祎的职业轨迹是一场缓慢而坚定的自我建立。
            </p>
            <p>
              她在荧幕中保存人物的情绪，也在音乐里留下自己的声音。这里记录的是公开可核实的作品与经历，而非未经证实的传闻；每一个年份，都尽量回到作品本身。
            </p>
            <div className="identityList" aria-label="身份标签">
              <span>演员 ACTRESS</span>
              <span>歌手 SINGER</span>
              <span>舞者 DANCER</span>
            </div>
            <div className="sourceBlock">
              <p>人物资料来源</p>
              <div>
                {sources.map(([label, href]) => (
                  <a href={href} target="_blank" rel="noreferrer" key={label}>
                    {label} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="siteFooter">
        <div className="footerTop">
          <p className="footerName">JU JINGYI</p>
          <p>演员 · 歌手<br />1994—PRESENT</p>
        </div>
        <div className="footerGrid">
          <nav aria-label="页脚导航">
            <p>页面</p>
            <a href="#works">代表作</a>
            <a href="#journey">生平经历</a>
            <a href="#gallery">影像</a>
            <a href="#about">关于</a>
          </nav>
          <div className="creditColumn">
            <p>图片授权</p>
            <p>
              “Ju Jing Yi 27th” — Camellia234，
              <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>，已裁剪。
            </p>
            <p>
              2017 舞台肖像 — Aco，
              <a href="https://creativecommons.org/licenses/by/2.5/" target="_blank" rel="noreferrer">CC BY 2.5</a>，已裁剪。
            </p>
            <p>
              SNH48 舞台 — 纸鱼_咲，
              <a href="https://creativecommons.org/licenses/by/2.5/" target="_blank" rel="noreferrer">CC BY 2.5</a>，已裁剪。
            </p>
          </div>
          <div className="footerNote">
            <p>说明</p>
            <p>非官方人物资料页。人物与作品版权归相关权利方所有；页面仅作信息整理与非商业展示。</p>
          </div>
        </div>
        <div className="footerBottom">
          <span>© 2026 PORTRAIT ARCHIVE</span>
          <a href="#top">回到顶部 ↑</a>
        </div>
      </footer>
    </>
  );
}
