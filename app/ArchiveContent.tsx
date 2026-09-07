import { works, timeline, gallery, sources } from "./archive-data";
import WorksShowcase from "./WorksShowcase";

export default function ArchiveContent() {
  return (
    <>
      <a className="skipLink" href="#main-content">
        跳到主要内容
      </a>


      <main id="main-content">
        <header className="archiveIntro" id="archive-top"><p className="eyebrow">THE COMPLETE ARCHIVE</p><h1>鞠婧祎</h1><p>演员 · 歌手 / 1994—PRESENT</p></header>

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
              点击封面，可直接进入官方作品页面。
            </p>
          </div>

          <WorksShowcase works={works} />
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
                  <img
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                    decoding="async"
                  />
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
              width={1174}
              height={1800}
              loading="lazy"
              decoding="async"
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
            <p>图片与封面来源</p>
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
            <p>
              作品封面来自对应的
              <a href="https://www.iq.com/" target="_blank" rel="noreferrer"> iQIYI</a>、
              <a href="https://music.apple.com/" target="_blank" rel="noreferrer">Apple Music</a> 与
              <a href="https://www.youku.tv/" target="_blank" rel="noreferrer">优酷</a>官方作品页，仅用于作品识别，版权归相关权利方所有。
            </p>
          </div>
          <div className="footerNote">
            <p>说明</p>
            <p>非官方人物资料页。人物与作品版权归相关权利方所有；页面仅作信息整理与非商业展示。</p>
          </div>
        </div>
        <div className="footerBottom">
          <span>© 2026 PORTRAIT ARCHIVE</span>
          <a href="#archive-top">回到顶部 ↑</a>
        </div>
      </footer>
    </>
  );
}
