(function(){
  "use strict";

  var header = document.getElementById('site-header');
  var menuToggle = document.getElementById('menu-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  var progressFill = document.getElementById('progress-fill');

  /* Sticky header shrink-on-scroll + scroll-progress rail */
  function onScroll(){
    if(window.scrollY > 40){ header.classList.add('is-scrolled'); }
    else{ header.classList.remove('is-scrolled'); }

    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressFill.style.width = progress + '%';
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu toggle */
  menuToggle.addEventListener('click', function(){
    var isOpen = menuToggle.classList.toggle('is-open');
    mobileNav.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  mobileNav.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      menuToggle.classList.remove('is-open');
      mobileNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* Scroll reveal via IntersectionObserver, with staggered children */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('[data-reveal]');

  if(reduceMotion || !('IntersectionObserver' in window)){
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var el = entry.target;
          var delay = el.dataset.revealDelay ? parseInt(el.dataset.revealDelay, 10) : 0;
          setTimeout(function(){ el.classList.add('is-visible'); }, delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function(el){ io.observe(el); });
  }

  /* Auto-stagger: within any [data-reveal-group], assign incremental delays */
  document.querySelectorAll('[data-reveal-group]').forEach(function(group){
    var children = group.querySelectorAll('[data-reveal]');
    children.forEach(function(el, i){
      if(!el.dataset.revealDelay){ el.dataset.revealDelay = String(i * 90); }
    });
  });

  /* FAQ accordion — single item open at a time */
  document.querySelectorAll('.accordion').forEach(function(accordion){
    var items = accordion.querySelectorAll('.accordion-item');
    items.forEach(function(item){
      var trigger = item.querySelector('.accordion-trigger');
      var panel = item.querySelector('.accordion-panel');
      trigger.addEventListener('click', function(){
        var isOpen = item.classList.contains('is-open');
        items.forEach(function(other){
          other.classList.remove('is-open');
          other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
          other.querySelector('.accordion-panel').style.maxHeight = null;
        });
        if(!isOpen){
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  });

  /* Count-up animation for stat numbers, triggered once on scroll into view */
  var counters = document.querySelectorAll('.count[data-count-to]');
  function animateCount(el){
    var to = parseInt(el.dataset.countTo, 10);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    if(reduceMotion){ el.textContent = prefix + to + suffix; return; }
    var start = null;
    var duration = 1400;
    function step(ts){
      if(start === null){ start = ts; }
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + Math.round(eased * to) + suffix;
      if(progress < 1){ requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }
  if(counters.length){
    if(reduceMotion || !('IntersectionObserver' in window)){
      counters.forEach(function(el){ animateCount(el); });
    } else {
      var countObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function(el){ countObserver.observe(el); });
    }
  }

  /* Contact form — builds a pre-filled mailto (this is a static site, no backend) */
  var contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = contactForm.name.value.trim();
      var company = contactForm.company.value.trim();
      var email = contactForm.email.value.trim();
      var phone = contactForm.phone.value.trim();
      var service = contactForm.service.value;
      var message = contactForm.message.value.trim();

      var body = [
        'Navn: ' + name,
        'Bedrift: ' + company,
        'E-post: ' + email,
        'Telefon: ' + phone,
        'Tjeneste: ' + service,
        '',
        message
      ].join('\n');

      var mailto = 'mailto:kim.kristoffersen@vantum.no'
        + '?subject=' + encodeURIComponent('Forespørsel fra ' + (company || name))
        + '&body=' + encodeURIComponent(body);

      window.location.href = mailto;
      document.getElementById('form-success').classList.add('is-visible');
    });
  }

})();
