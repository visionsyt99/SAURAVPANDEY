(function () {
  "use strict";

  /* ---------- theme ---------- */
  var STORAGE_KEY = "sp-theme";
  function applyTheme(theme) {
    var root = document.documentElement;
    root.classList.toggle("theme-paper", theme === "paper");
    root.classList.toggle("theme-ink", theme === "ink");
    root.dataset.theme = theme;
  }
  function getTheme() {
    try {
      var t = localStorage.getItem(STORAGE_KEY);
      return t === "paper" || t === "ink" ? t : "ink";
    } catch (e) {
      return "ink";
    }
  }
  applyTheme(getTheme());

  window.addEventListener("DOMContentLoaded", function () {
    var fine = window.matchMedia("(pointer: fine)").matches;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var btn = document.getElementById("themeBtn");
    if (btn) {
      btn.addEventListener("click", function () {
        var next = document.documentElement.dataset.theme === "paper" ? "ink" : "paper";
        applyTheme(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch (e) {}
      });
    }

    /* ---------- nav scroll state + reveal-in ---------- */
    var nav = document.getElementById("siteNav");
    function onScroll() {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
      var prog = document.getElementById("scrollProgress");
      if (prog) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var ratio = h > 0 ? window.scrollY / h : 0;
        prog.style.transform = "scaleX(" + Math.min(1, Math.max(0, ratio)) + ")";
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- mobile menu ---------- */
    var burger = document.getElementById("burger");
    var mobileMenu = document.getElementById("mobileMenu");
    if (burger && mobileMenu) {
      burger.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
      });
      mobileMenu.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          mobileMenu.classList.remove("open");
        });
      });
    }

    var main = document.querySelector("main");

    /* ---------- split-word hero reveal (+ per-letter spans for distortion) ---------- */
    document.querySelectorAll(".split-words").forEach(function (el) {
      var text = el.textContent.trim();
      el.textContent = "";
      text.split(" ").forEach(function (word, i) {
        var span = document.createElement("span");
        span.className = "split";
        var inner = document.createElement("i");
        inner.style.transitionDelay = i * 0.06 + "s";
        word.split("").forEach(function (ch) {
          var c = document.createElement("span");
          c.className = "char";
          c.textContent = ch;
          inner.appendChild(c);
        });
        span.appendChild(inner);
        el.appendChild(span);
        el.appendChild(document.createTextNode(" "));
      });
    });

    /* ---------- intro sequence, runs after preloader finishes ---------- */
    function startIntro() {
      requestAnimationFrame(function () {
        if (nav) nav.classList.add("ready");
      });
      requestAnimationFrame(function () {
        if (main) main.classList.add("enter");
      });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          document.body.classList.add("loaded");
        });
      });
    }

    /* ---------- preloader ---------- */
    var preloader = document.getElementById("preloader");
    if (preloader && !reduced) {
      var fillEl = document.getElementById("preloaderFill");
      var pctEl = document.getElementById("preloaderPct");
      var progress = 0;
      var tick = setInterval(function () {
        progress += Math.random() * 22 + 8;
        if (progress >= 100) {
          progress = 100;
          clearInterval(tick);
          if (fillEl) fillEl.style.width = "100%";
          if (pctEl) pctEl.textContent = "100%";
          setTimeout(function () {
            preloader.classList.add("hide");
            startIntro();
            setTimeout(function () {
              if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
            }, 750);
          }, 260);
          return;
        }
        if (fillEl) fillEl.style.width = progress + "%";
        if (pctEl) pctEl.textContent = Math.round(progress) + "%";
      }, 130);
    } else {
      if (preloader) preloader.parentNode.removeChild(preloader);
      startIntro();
    }

    /* ---------- hero letter distortion on hover ---------- */
    var heroH1 = document.querySelector(".hero h1");
    if (heroH1 && fine && !reduced) {
      var distortChars = [];
      function measureChars() {
        distortChars = Array.prototype.slice.call(heroH1.querySelectorAll(".char")).map(function (c) {
          var r = c.getBoundingClientRect();
          return { el: c, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        });
      }
      window.addEventListener("load", measureChars);
      window.addEventListener("resize", measureChars);
      setTimeout(measureChars, 1200);
      var DISTORT_RADIUS = 150;
      heroH1.addEventListener("mousemove", function (e) {
        distortChars.forEach(function (c) {
          var dx = e.clientX - c.cx;
          var dy = e.clientY - c.cy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < DISTORT_RADIUS) {
            var power = 1 - dist / DISTORT_RADIUS;
            var ty = -power * 20;
            var scale = 1 + power * 0.4;
            var skew = (dx / DISTORT_RADIUS) * power * 12;
            c.el.style.transform = "translateY(" + ty + "px) scale(" + scale + ") skewX(" + skew + "deg)";
          } else {
            c.el.style.transform = "";
          }
        });
      });
      heroH1.addEventListener("mouseleave", function () {
        distortChars.forEach(function (c) {
          c.el.style.transform = "";
        });
      });
    }

    /* ---------- reveal on scroll ---------- */
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "-40px" }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("in");
      });
    }

    /* ---------- auto last-updated stamp ---------- */
    var lastUpdatedEl = document.getElementById("lastUpdated");
    if (lastUpdatedEl) {
      var months = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
      var now = new Date();
      lastUpdatedEl.textContent = "LAST UPDATED — " + months[now.getMonth()] + " " + now.getFullYear();
    }

    /* ---------- cinematic chrono timeline (accordion) ---------- */
    document.querySelectorAll(".chrono-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var item = card.closest(".chrono-item");
        var wasOpen = item.classList.contains("open");
        item.parentElement.querySelectorAll(".chrono-item.open").forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove("open");
            openItem.querySelector(".chrono-card").setAttribute("aria-expanded", "false");
          }
        });
        item.classList.toggle("open", !wasOpen);
        card.setAttribute("aria-expanded", String(!wasOpen));
      });
    });

    /* ---------- count-up numbers ---------- */
    function animateCount(el) {
      var target = parseFloat(el.dataset.target || "0");
      var decimals = parseInt(el.dataset.decimals || "0", 10);
      var duration = 1400;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString();
      }
      requestAnimationFrame(step);
    }
    var countEls = document.querySelectorAll(".count-num[data-target]");
    if ("IntersectionObserver" in window && countEls.length) {
      var countIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countIo.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      countEls.forEach(function (el) {
        countIo.observe(el);
      });
    } else {
      countEls.forEach(function (el) {
        var d = parseInt(el.dataset.decimals || "0", 10);
        var t = parseFloat(el.dataset.target || "0");
        el.textContent = d ? t.toFixed(d) : t.toLocaleString();
      });
    }

    /* ---------- subject pill selector ---------- */
    var subjectPills = document.getElementById("subjectPills");
    var selectedSubject = "Collaboration";
    if (subjectPills) {
      selectedSubject = subjectPills.querySelector(".subject-pill.active").dataset.value;
      subjectPills.querySelectorAll(".subject-pill").forEach(function (pill) {
        pill.addEventListener("click", function () {
          subjectPills.querySelectorAll(".subject-pill").forEach(function (p) {
            p.classList.remove("active");
            p.setAttribute("aria-checked", "false");
          });
          pill.classList.add("active");
          pill.setAttribute("aria-checked", "true");
          selectedSubject = pill.dataset.value;
        });
      });
    }

    /* ---------- contact form ---------- */
    var contactForm = document.getElementById("contactForm");
    if (contactForm) {
      contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = document.getElementById("cName").value.trim();
        var email = document.getElementById("cEmail").value.trim();
        var message = document.getElementById("cMessage").value.trim();
        var subject = encodeURIComponent("[" + selectedSubject + "] from " + (name || "your site"));
        var body = encodeURIComponent(
          message + "\n\n---\nFrom: " + (name || "-") + "\nEmail: " + (email || "-")
        );
        window.location.href = "mailto:vsauravpandey99@gmail.com?subject=" + subject + "&body=" + body;
      });
    }
    var copyBtn = document.getElementById("copyEmailBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var email = "vsauravpandey99@gmail.com";
        var feedback = document.getElementById("copyFeedback");
        function showFeedback() {
          if (feedback) {
            feedback.style.opacity = "1";
            setTimeout(function () {
              feedback.style.opacity = "0";
            }, 1600);
          }
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(showFeedback);
        } else {
          var temp = document.createElement("textarea");
          temp.value = email;
          document.body.appendChild(temp);
          temp.select();
          try {
            document.execCommand("copy");
          } catch (e) {}
          document.body.removeChild(temp);
          showFeedback();
        }
      });
    }

    /* ---------- cursor spotlight ---------- */
    var spot = document.getElementById("spotlight");
    if (spot && window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var frame = 0;
      window.addEventListener(
        "mousemove",
        function (e) {
          if (frame) return;
          frame = requestAnimationFrame(function () {
            frame = 0;
            spot.style.background =
              "radial-gradient(460px at " + e.clientX + "px " + e.clientY + "px, var(--glow), transparent 70%)";
            spot.classList.add("on");
          });
        },
        { passive: true }
      );
    }

    /* ---------- hero parallax ---------- */
    var hero = document.querySelector(".hero");
    if (hero && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var heroInner = hero.querySelector(".hero-inner");
      window.addEventListener(
        "scroll",
        function () {
          var rect = hero.getBoundingClientRect();
          var progress = Math.min(1, Math.max(0, -rect.top / hero.offsetHeight));
          if (heroInner) {
            heroInner.style.transform = "translateY(" + progress * 140 + "px)";
            heroInner.style.opacity = String(1 - Math.min(1, progress / 0.8));
          }
        },
        { passive: true }
      );
    }

    /* ---------- custom cursor: particle arrow-trail (canvas) ---------- */
    if (fine && !reduced) {
      document.documentElement.classList.add("custom-cursor-enabled");

      var canvas = document.createElement("canvas");
      canvas.className = "cursor-canvas";
      document.body.appendChild(canvas);
      var ctx = canvas.getContext("2d");
      var cw = (canvas.width = window.innerWidth);
      var ch = (canvas.height = window.innerHeight);

      var TOTAL = 14;
      var FOLLOW_SPEED = 0.16;
      var SIZE = 20;
      var mouseX = 0,
        mouseY = 0,
        hasMouse = false,
        hoverScale = 1,
        particles = [],
        rafId;

      window.addEventListener(
        "mousemove",
        function (e) {
          mouseX = e.clientX;
          mouseY = e.clientY;
          hasMouse = true;
        },
        { passive: true }
      );
      window.addEventListener("resize", function () {
        cw = canvas.width = window.innerWidth;
        ch = canvas.height = window.innerHeight;
      });

      function Particle(index) {
        this.x = -50;
        this.y = ch;
        this.id = index + 1;
        this.angleX = Math.PI * 2 * Math.random();
        this.angleY = Math.PI * 2 * Math.random();
        this.speedX = 0.03 * Math.random() + 0.03;
        this.speedY = 0.03 * Math.random() + 0.03;
        this.radius = 120;
      }
      Particle.prototype.update = function () {
        var aim, dx, dy, scale, angle;
        if (this.id > 1) {
          aim = particles[this.id - 1 - 1];
          dx = aim.x - this.x;
          dy = aim.y - this.y;
          this.x += dx * FOLLOW_SPEED;
          this.y += dy * FOLLOW_SPEED;
        } else if (!hasMouse) {
          this.x = cw / 2 + Math.cos(this.angleX) * this.radius;
          this.y = ch / 2 + Math.sin(this.angleY) * this.radius;
          dx = Math.cos(this.angleX + 0.01);
          dy = Math.sin(this.angleY + 0.01);
          this.angleX += this.speedX;
          this.angleY += this.speedY;
        } else {
          dx = mouseX - this.x;
          dy = mouseY - this.y;
          this.x += dx * FOLLOW_SPEED;
          this.y += dy * FOLLOW_SPEED;
        }
        angle = Math.atan2(dy, dx);
        scale = Math.cos((Math.PI / 2) * (this.id / TOTAL)) * hoverScale;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.moveTo(-SIZE / 2 * 1.732, -SIZE / 2);
        ctx.lineTo(0, 0);
        ctx.lineTo(-SIZE / 2 * 1.732, SIZE / 2);
        ctx.lineTo(-SIZE / 2 * 1.2, 0);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
      };

      function initParticles() {
        particles = [];
        for (var i = 0; i < TOTAL; i += 1) particles.push(new Particle(i));
      }
      function draw() {
        ctx.clearRect(0, 0, cw, ch);
        for (var i = 0; i < TOTAL; i += 1) particles[i].update();
        rafId = requestAnimationFrame(draw);
      }
      initParticles();
      draw();

      function bindHoverTargets() {
        document
          .querySelectorAll("a, button, input, textarea, select, [role='button'], .hover-lift")
          .forEach(function (el) {
            if (el.dataset.cursorBound) return;
            el.dataset.cursorBound = "1";
            el.addEventListener("mouseenter", function () {
              hoverScale = 1.7;
            });
            el.addEventListener("mouseleave", function () {
              hoverScale = 1;
            });
          });
      }
      bindHoverTargets();
      window.__rebindCursor = bindHoverTargets;
    }

    /* ---------- side scroll dot navigator ---------- */
    var dotSections = Array.prototype.slice.call(document.querySelectorAll("[data-dot]"));
    if (dotSections.length) {
      var dotNav = document.createElement("nav");
      dotNav.className = "dot-nav";
      dotNav.setAttribute("aria-label", "Section navigator");
      var dotItems = dotSections.map(function (sec, i) {
        if (!sec.id) sec.id = "dot-section-" + i;
        var item = document.createElement("a");
        item.href = "#" + sec.id;
        item.className = "dot-item";
        item.innerHTML = '<span class="dot"></span><span class="dot-label">' + sec.dataset.dot + "</span>";
        item.addEventListener("click", function (e) {
          e.preventDefault();
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        dotNav.appendChild(item);
        return item;
      });
      document.body.appendChild(dotNav);

      if ("IntersectionObserver" in window) {
        var dotIo = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              var idx = dotSections.indexOf(entry.target);
              if (idx === -1) return;
              if (entry.isIntersecting) {
                dotItems.forEach(function (it) {
                  it.classList.remove("active");
                });
                dotItems[idx].classList.add("active");
              }
            });
          },
          { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
        );
        dotSections.forEach(function (sec) {
          dotIo.observe(sec);
        });
      }
    }

    /* ---------- portrait tilt + spotlight ---------- */
    document.querySelectorAll(".portrait").forEach(function (p) {
      var glow = document.createElement("div");
      glow.className = "portrait-glow";
      var frame = document.createElement("div");
      frame.className = "portrait-frame";
      p.appendChild(glow);
      p.appendChild(frame);
      if (fine && !reduced) {
        p.addEventListener("mousemove", function (e) {
          var r = p.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width;
          var y = (e.clientY - r.top) / r.height;
          var rotY = (x - 0.5) * 16;
          var rotX = (0.5 - y) * 16;
          p.style.transform = "perspective(900px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg)";
          p.style.setProperty("--gx", x * 100 + "%");
          p.style.setProperty("--gy", y * 100 + "%");
        });
        p.addEventListener("mouseleave", function () {
          p.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
        });
      }
    });

    /* ---------- project cards: cursor-follow badge + modal ---------- */
    var PROJECTS = {
      aura: {
        label: "Smart Study Companion",
        title: "AURA V.2",
        year: "2025",
        desc: "A free digital study companion for Nepal's +2 Science students — 500+ formulas, 1,000+ MCQs, 10-minute revision mode, instant feedback, offline support and dark mode.",
        meta: "168 Physics formulas / 340 MCQs · 145 Chemistry reactions / 380 MCQs · 200+ Maths formulas / 290 MCQs",
        tags: ["EdTech", "Frontend", "Product"],
        url: "https://visionsyt99.github.io/SAURAVPANDEY-AURA/AURA2.HTML"
      },
      visions: {
        label: "Founder & CEO · Since 2023",
        title: "Vision_S",
        year: "2023",
        desc: "A futuristic creative brand exploring AI, design, innovation, visual experimentation and digital experiences. Currently a non-profit, service-oriented initiative.",
        meta: "Technology × Creativity × Innovation × Design × Imagination",
        tags: ["Brand", "AI", "Creative Tech"],
        url: "https://saurav-pandey999.github.io/worldofvisions/"
      },
      cee: {
        label: "Entrance Exam Practice Engine",
        title: "CEE Simulator",
        year: "2025",
        desc: "A full CEE entrance-exam simulator built for medical aspirants — timed mock tests, realistic question flow and instant scoring, all in the browser.",
        meta: "Timed sets · Instant scoring · Zero-install, works on any device",
        tags: ["EdTech", "Web App", "Simulation"],
        url: "https://saurav-pandey999.github.io/worldofvisions/cee.html"
      },
      youtube: {
        label: "Video & Cinematography",
        title: "VISION-S on YouTube",
        year: "2024",
        desc: "Video editing, cinematography and visual storytelling — the creative counterweight to the code.",
        meta: "Event media · Creative direction · Digital production",
        tags: ["Video", "Story", "Media"],
        url: "https://www.youtube.com/@VISIONS-9"
      }
    };

    var modalBackdrop = document.getElementById("projectModalBackdrop");
    if (modalBackdrop) {
      var modalLabel = document.getElementById("modalLabel");
      var modalTitle = document.getElementById("modalTitle");
      var modalYear = document.getElementById("modalYear");
      var modalDesc = document.getElementById("modalDesc");
      var modalMeta = document.getElementById("modalMeta");
      var modalTags = document.getElementById("modalTags");
      var modalLink = document.getElementById("modalLink");
      var modalClose = document.getElementById("modalClose");
      var lastFocused = null;

      function openModal(key) {
        var data = PROJECTS[key];
        if (!data) return;
        lastFocused = document.activeElement;
        modalLabel.textContent = data.label;
        modalTitle.textContent = data.title;
        modalYear.textContent = data.year;
        modalDesc.textContent = data.desc;
        modalMeta.textContent = data.meta || "";
        modalMeta.style.display = data.meta ? "block" : "none";
        modalTags.innerHTML = "";
        (data.tags || []).forEach(function (t) {
          var span = document.createElement("span");
          span.className = "chip";
          span.textContent = t;
          modalTags.appendChild(span);
        });
        modalLink.href = data.url;
        modalBackdrop.classList.add("open");
        document.body.style.overflow = "hidden";
        if (window.__rebindCursor) window.__rebindCursor();
      }
      function closeModal() {
        modalBackdrop.classList.remove("open");
        document.body.style.overflow = "";
        if (lastFocused) lastFocused.focus();
      }
      modalClose.addEventListener("click", closeModal);
      modalBackdrop.addEventListener("click", function (e) {
        if (e.target === modalBackdrop) closeModal();
      });
      window.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modalBackdrop.classList.contains("open")) closeModal();
      });

      document.querySelectorAll("[data-project]").forEach(function (card) {
        var badge = document.createElement("span");
        badge.className = "view-badge";
        badge.textContent = "View";
        card.appendChild(badge);
        card.addEventListener("mousemove", function (e) {
          var r = card.getBoundingClientRect();
          badge.style.left = e.clientX - r.left + "px";
          badge.style.top = e.clientY - r.top + "px";
        });
        function trigger() {
          openModal(card.dataset.project);
        }
        card.addEventListener("click", trigger);
        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            trigger();
          }
        });
      });
    }
  });
})();
