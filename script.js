// Target wedding date: Dec 11, 2026
const weddingDate = new Date("December 11, 2026 10:00:00").getTime();

const updateCountdown = () => {
  const now = new Date().getTime();
  const diff = weddingDate - now;

  if (diff > 0) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (daysEl) daysEl.innerText = days.toString().padStart(2, "0");
    if (hoursEl) hoursEl.innerText = hours.toString().padStart(2, "0");
    if (minutesEl) minutesEl.innerText = minutes.toString().padStart(2, "0");
    if (secondsEl) secondsEl.innerText = seconds.toString().padStart(2, "0");
  }
};

setInterval(updateCountdown, 1000);
updateCountdown();

// Scroll & UI Interactions
document.addEventListener('DOMContentLoaded', function() {
  const scrollPrompt = document.getElementById('scrollPrompt');
  const weddingInviteCard = document.getElementById('weddingInviteCard');

  if (scrollPrompt && weddingInviteCard) {
    scrollPrompt.addEventListener('click', () => {
      weddingInviteCard.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Scroll Reveal for invitation card
  const observerOptions = {
    threshold: 0.15
  };

  const inviteObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, observerOptions);

  if (weddingInviteCard) {
    inviteObserver.observe(weddingInviteCard);
  }

  // Family Side Selection (Bride vs Groom Toggle)
  const familySliderToggle = document.getElementById('familySliderToggle');
  const sliderThumb = document.getElementById('sliderThumb');
  const lblNikita = document.getElementById('lblNikita');
  const lblKhushal = document.getElementById('lblKhushal');
  const heroWelcomeTitle = document.querySelector('.hero-container .title');
  const footerNames = document.getElementById('footerNames');

  const firstName = document.getElementById('firstName');
  const secondName = document.getElementById('secondName');
  const firstRelationLabel = document.getElementById('firstRelationLabel');
  const firstParentNames = document.getElementById('firstParentNames');
  const secondRelationLabel = document.getElementById('secondRelationLabel');
  const secondParentNames = document.getElementById('secondParentNames');

  function setFamilySide(side) {
    if (side === 'bride') {
      document.body.setAttribute('data-family', 'bride');
      if (sliderThumb) sliderThumb.textContent = 'N';
      if (lblNikita) lblNikita.classList.add('active');
      if (lblKhushal) lblKhushal.classList.remove('active');
      if (heroWelcomeTitle) heroWelcomeTitle.textContent = 'Nikita Weds Khushal';
      if (footerNames) footerNames.innerHTML = 'Nikita <span class="amp">&</span> Khushal';

      if (firstName) firstName.textContent = 'Nikita';
      if (secondName) secondName.textContent = 'Khushal';
      if (firstRelationLabel) firstRelationLabel.textContent = 'Daughter of';
      if (firstParentNames) firstParentNames.textContent = 'Mrs. Guddi Gosai & Mr. Diwan Singh Gosai';
      if (secondRelationLabel) secondRelationLabel.textContent = 'Son of';
      if (secondParentNames) secondParentNames.textContent = 'Mrs. Rajni Goyal & Mr. Mukesh Kumar Goyal';

      localStorage.setItem('wedding_side', 'bride');
    } else {
      document.body.setAttribute('data-family', 'groom');
      if (sliderThumb) sliderThumb.textContent = 'K';
      if (lblKhushal) lblKhushal.classList.add('active');
      if (lblNikita) lblNikita.classList.remove('active');
      if (heroWelcomeTitle) heroWelcomeTitle.textContent = 'Khushal Weds Nikita';
      if (footerNames) footerNames.innerHTML = 'Khushal <span class="amp">&</span> Nikita';

      if (firstName) firstName.textContent = 'Khushal';
      if (secondName) secondName.textContent = 'Nikita';
      if (firstRelationLabel) firstRelationLabel.textContent = 'Son of';
      if (firstParentNames) firstParentNames.textContent = 'Mrs. Rajni Goyal & Mr. Mukesh Kumar Goyal';
      if (secondRelationLabel) secondRelationLabel.textContent = 'Daughter of';
      if (secondParentNames) secondParentNames.textContent = 'Mrs. Guddi Gosai & Mr. Diwan Singh Gosai';

      localStorage.setItem('wedding_side', 'groom');
    }
  }

  const savedSide = localStorage.getItem('wedding_side') || 'bride';
  setFamilySide(savedSide);

  if (familySliderToggle) {
    familySliderToggle.addEventListener('click', () => {
      const current = localStorage.getItem('wedding_side') || 'bride';
      setFamilySide(current === 'bride' ? 'groom' : 'bride');
    });
  }

  // Wishes Modal Controls
  const openWishesModal = document.getElementById('openWishesModal');
  const wishesModalOverlay = document.getElementById('wishesModalOverlay');
  const closeWishesModal = document.getElementById('closeWishesModal');
  const wishesForm = document.getElementById('wishesForm');
  const wishesSuccess = document.getElementById('wishesSuccess');

  if (openWishesModal && wishesModalOverlay) {
    openWishesModal.addEventListener('click', () => {
      wishesModalOverlay.classList.remove('hidden');
    });
  }

  if (closeWishesModal && wishesModalOverlay) {
    closeWishesModal.addEventListener('click', () => {
      wishesModalOverlay.classList.add('hidden');
    });
  }

  if (wishesForm) {
    wishesForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (window.festive) window.festive.confetti(window.innerWidth / 2, window.innerHeight / 2, 60);
      if (wishesSuccess) {
        wishesSuccess.classList.remove('d-none');
        setTimeout(() => {
          wishesSuccess.classList.add('d-none');
          wishesModalOverlay.classList.add('hidden');
          wishesForm.reset();
        }, 2000);
      }
    });
  }

  // Music toggle is handled in js/festive.js
});
