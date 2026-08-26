/* =========================================
   DANIA KHAN — Portfolio interactions
   1. Navbar scroll + mobile menu
   2. Scroll reveal
   3. Active nav link
   4. Ambient node particles
   5. Contact form
   6. Footer year
   ========================================= */

(function () {
  "use strict";

  /* ---------- 1. Navbar scroll + mobile menu ---------- */
  var navbar = document.getElementById("navbar");
  var hamburger = document.getElementById("hamburger");
  var navLinks = document.getElementById("nav-links");

  function onScroll() {
    if (window.scrollY > 30) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  }

  hamburger.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  /* ---------- 2. Scroll reveal ---------- */
  var revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            setTimeout(function () {
              entry.target.classList.add("visible");
            }, i * 70);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealItems.forEach(function (el) { observer.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- 3. Active nav link on scroll ---------- */
  var sections = document.querySelectorAll("section[id]");
  window.addEventListener("scroll", function () {
    var pos = window.scrollY + 140;
    sections.forEach(function (section) {
      var link = document.querySelector('.nav-links a[href="#' + section.id + '"]');
      if (!link) return;
      if (pos >= section.offsetTop && pos < section.offsetTop + section.offsetHeight) {
        document.querySelectorAll(".nav-links a").forEach(function (a) { a.classList.remove("active"); });
        link.classList.add("active");
      }
    });
  }, { passive: true });

  /* ---------- 4. Ambient node particles ---------- */
  var canvas = document.getElementById("nodes-canvas");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var count = window.innerWidth < 768 ? 22 : 46;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function build() {
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.6 + 0.6,
          pink: Math.random() > 0.55
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // connecting lines
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx = particles[i].x - particles[j].x;
          var dy = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.strokeStyle = "rgba(255,255,255," + (0.055 * (1 - dist / 130)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // nodes
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.pink ? "rgba(255,20,147,0.55)" : "rgba(0,168,255,0.45)";
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    resize();
    build();
    draw();
    window.addEventListener("resize", function () { resize(); build(); });
  }

 /* ---------- 5. Contact form ---------- */

var form = document.getElementById("contact-form");
var note = document.getElementById("form-note");

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var company = form.company.value.trim();
    var phone = form.phone.value.trim();
    var project = form.project.value;
    var team = form.team.value;
    var budget = form.budget.value;
    var timeline = form.timeline.value;
    var message = form.message.value.trim();

    var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name || !validEmail || !project || !message) {
      note.textContent =
        "Please fill in your name, a valid email, project type and message.";
      note.classList.add("error");
      return;
    }

    note.classList.remove("error");
    note.textContent = "Sending your project request...";

    var leadData = {
      name: name,
      email: email,
      company: company,
      phone: phone,
      project: project,
      team: team,
      budget: budget,
      timeline: timeline,
      message: message,
      submittedAt: new Date().toISOString()
    };

    try {
      var response = await fetch(
        "https://daniakhan.app.n8n.cloud/webhook/portfolio",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(leadData)
        }
      );

      if (!response.ok) {
        throw new Error("Webhook request failed");
      }

      note.textContent =
        "Thank you " + name + "! Your project request has been sent successfully.";

      form.reset();

    } catch (error) {
      console.error(error);

      note.textContent =
        "Something went wrong. Please try again or contact me by email.";

      note.classList.add("error");
    }
  });
}
  /* ---------- 6. Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
