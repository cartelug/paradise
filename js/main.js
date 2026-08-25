  // Nav scroll state
  var nav = document.getElementById('siteNav');
  var onScroll = function(){
    if(window.scrollY > 60){ nav.classList.add('is-scrolled'); }
    else{ nav.classList.remove('is-scrolled'); }
  };
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // Mobile nav
  var burger = document.getElementById('burgerBtn');
  var panel = document.getElementById('mobilePanel');
  burger.addEventListener('click', function(){
    var open = panel.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  panel.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      panel.classList.remove('is-open');
      burger.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    });
  });

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.14, rootMargin:'0px 0px -60px 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  // Scrollspy nav active state
  var navLinks = document.querySelectorAll('[data-nav]');
  var spySections = Array.prototype.slice.call(navLinks).map(function(a){
    return document.querySelector(a.getAttribute('href'));
  }).filter(Boolean);
  if('IntersectionObserver' in window && spySections.length){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var id = '#' + entry.target.id;
          navLinks.forEach(function(a){
            a.classList.toggle('is-active', a.getAttribute('href') === id);
          });
        }
      });
    }, {rootMargin:'-45% 0px -50% 0px', threshold:0});
    spySections.forEach(function(s){ spy.observe(s); });
  }

  // Tailor-made form
  var form = document.getElementById('journeyForm');
  var success = document.getElementById('formSuccess');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!form.checkValidity()){ form.reportValidity(); return; }
    form.classList.add('is-submitted');
    success.classList.add('is-visible');
    success.scrollIntoView({behavior:'smooth', block:'center'});
  });
  document.getElementById('resetForm').addEventListener('click', function(){
    form.reset();
    form.classList.remove('is-submitted');
    success.classList.remove('is-visible');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
