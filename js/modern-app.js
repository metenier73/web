/**
 * Portfolio JavaScript - Version Moderne
 * Améliorations: ES6+, gestion d'erreurs, accessibilité, performance
 */

// Configuration globale
const CONFIG = {
  animationDuration: 300,
  scrollOffset: 100,
  apiEndpoint: 'https://api.example.com/contact',
  debug: false
};

// Classe principale de l'application
class PortfolioApp {
  constructor() {
    this.currentPlanet = null;
    this.isAnimating = false;
    this.init();
  }

  /**
   * Initialisation de l'application
   */
  init() {
    try {
      this.setupEventListeners();
      this.initializeSolarSystem();
      this.setupSmoothScrolling();
      this.setupAccessibility();
      this.setupPerformanceOptimizations();
      
      if (CONFIG.debug) {
        console.log('Portfolio app initialized successfully');
      }
    } catch (error) {
      console.error('Error initializing portfolio app:', error);
      this.handleError(error);
    }
  }

  /**
   * Configuration des écouteurs d'événements
   */
  setupEventListeners() {
    // Navigation mobile
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
      navbarToggler.addEventListener('click', this.handleMobileMenu.bind(this));
    }

    // Système solaire interactif
    const planets = document.querySelectorAll('.solarsystem li');
    planets.forEach(planet => {
      planet.addEventListener('mouseenter', this.handlePlanetHover.bind(this));
      planet.addEventListener('mouseleave', this.handlePlanetLeave.bind(this));
      planet.addEventListener('click', this.handlePlanetClick.bind(this));
      planet.addEventListener('keydown', this.handlePlanetKeyboard.bind(this));
    });

    // Scroll events pour animations
    window.addEventListener('scroll', this.debounce(this.handleScroll.bind(this), 16));
    
    // Resize events
    window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));

    // Form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', this.handleFormSubmission.bind(this));
    }
  }

  /**
   * Initialisation du système solaire
   */
  initializeSolarSystem() {
    const descriptions = document.querySelectorAll('#descriptions li');
    const planets = document.querySelectorAll('.solarsystem li');

    // Positionnement des descriptions
    descriptions.forEach((desc, index) => {
      if (planets[index]) {
        const planet = planets[index];
        const rect = planet.getBoundingClientRect();
        const container = document.querySelector('.solar-system-container');
        const containerRect = container.getBoundingClientRect();
        
        desc.style.left = `${rect.left - containerRect.left + rect.width / 2 - 150}px`;
        desc.style.top = `${rect.top - containerRect.top + rect.height / 2 - 100}px`;
      }
    });

    // Animation d'entrée
    setTimeout(() => {
      planets.forEach((planet, index) => {
        setTimeout(() => {
          planet.style.opacity = '1';
          planet.style.transform = 'scale(1)';
        }, index * 100);
      });
    }, 500);
  }

  /**
   * Gestion du survol des planètes
   */
  handlePlanetHover(event) {
    if (this.isAnimating) return;
    
    const planet = event.currentTarget;
    const planetType = this.getPlanetType(planet);
    
    // Supprimer la classe active de toutes les planètes
    document.querySelectorAll('.solarsystem li').forEach(p => {
      p.classList.remove('active');
    });
    
    // Supprimer la classe active de toutes les descriptions
    document.querySelectorAll('#descriptions li').forEach(d => {
      d.classList.remove('active');
    });
    
    // Ajouter la classe active à la planète survolée
    planet.classList.add('active');
    
    // Afficher la description correspondante
    const description = document.querySelector(`#descriptions li[data-planet="${planetType}"]`);
    if (description) {
      description.classList.add('active');
    }
    
    this.currentPlanet = planetType;
  }

  /**
   * Gestion de la sortie du survol
   */
  handlePlanetLeave(event) {
    if (this.isAnimating) return;
    
    // Optionnel: garder la dernière planète active ou tout masquer
    // Pour l'instant, on masque tout
    setTimeout(() => {
      if (!this.currentPlanet) {
        document.querySelectorAll('.solarsystem li').forEach(p => {
          p.classList.remove('active');
        });
        document.querySelectorAll('#descriptions li').forEach(d => {
          d.classList.remove('active');
        });
      }
    }, 200);
  }

  /**
   * Gestion du clic sur les planètes
   */
  handlePlanetClick(event) {
    const planet = event.currentTarget;
    const link = planet.querySelector('a');
    
    if (link && link.href) {
      // Animation de transition avant navigation
      this.animateTransition(() => {
        window.location.href = link.href;
      });
    }
  }

  /**
   * Gestion du clavier pour l'accessibilité
   */
  handlePlanetKeyboard(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handlePlanetClick(event);
    }
  }

  /**
   * Obtention du type de planète
   */
  getPlanetType(planet) {
    const classes = planet.className.split(' ');
    return classes.find(cls => 
      ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(cls)
    );
  }

  /**
   * Gestion du menu mobile
   */
  handleMobileMenu(event) {
    const navbar = document.querySelector('.navbar-collapse');
    const isExpanded = event.currentTarget.getAttribute('aria-expanded') === 'true';
    
    if (navbar) {
      if (isExpanded) {
        navbar.classList.remove('show');
        event.currentTarget.setAttribute('aria-expanded', 'false');
      } else {
        navbar.classList.add('show');
        event.currentTarget.setAttribute('aria-expanded', 'true');
      }
    }
  }

  /**
   * Configuration du défilement fluide
   */
  setupSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /**
   * Configuration de l'accessibilité
   */
  setupAccessibility() {
    // Ajout de rôles ARIA manquants
    const nav = document.querySelector('nav');
    if (nav) {
      nav.setAttribute('role', 'navigation');
      nav.setAttribute('aria-label', 'Navigation principale');
    }

    // Gestion du focus pour les éléments interactifs
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, select');
    interactiveElements.forEach(element => {
      element.addEventListener('focus', this.handleFocus.bind(this));
      element.addEventListener('blur', this.handleBlur.bind(this));
    });

    // Support des raccourcis clavier
    document.addEventListener('keydown', (event) => {
      // Échap pour fermer les modales/menus
      if (event.key === 'Escape') {
        this.handleEscapeKey();
      }
    });
  }

  /**
   * Optimisations de performance
   */
  setupPerformanceOptimizations() {
    // Lazy loading des images
    const images = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }

    // Préchargement des ressources critiques
    this.preloadCriticalResources();
  }

  /**
   * Gestion du formulaire de contact
   */
  async handleFormSubmission(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
      // Validation côté client
      if (!this.validateForm(form)) {
        return;
      }

      // Désactiver le bouton pendant l'envoi
      submitButton.disabled = true;
      submitButton.textContent = 'Envoi en cours...';
      
      // Préparation des données
      const formData = new FormData(form);
      const jsonData = {};
      formData.forEach((value, key) => {
        jsonData[key] = value;
      });

      // Envoi des données
      const response = await this.sendFormData(jsonData);
      
      if (response.success) {
        this.showNotification('Message envoyé avec succès !', 'success');
        form.reset();
      } else {
        throw new Error(response.message || 'Erreur lors de l\'envoi');
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showNotification('Erreur lors de l\'envoi du message. Veuillez réessayer.', 'error');
    } finally {
      // Réactiver le bouton
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }

  /**
   * Validation du formulaire
   */
  validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        this.showFieldError(field, 'Ce champ est requis');
        isValid = false;
      } else {
        this.clearFieldError(field);
      }
    });

    // Validation email
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value)) {
        this.showFieldError(emailField, 'Adresse email invalide');
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Envoi des données du formulaire
   */
  async sendFormData(data) {
    // Simulation d'envoi - remplacer par votre API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Message envoyé' });
      }, 1000);
    });
  }

  /**
   * Affichage des notifications
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(notification);

    // Auto-suppression après 5 secondes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Gestion des erreurs
   */
  handleError(error) {
    console.error('Application error:', error);
    this.showNotification('Une erreur est survenue. Veuillez rafraîchir la page.', 'error');
  }

  /**
   * Utilitaires
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  animateTransition(callback) {
    this.isAnimating = true;
    document.body.style.opacity = '0.8';
    
    setTimeout(() => {
      callback();
      this.isAnimating = false;
      document.body.style.opacity = '1';
    }, CONFIG.animationDuration);
  }

  preloadCriticalResources() {
    const criticalResources = [
      'images/MIMI.jpg',
      'css/modern-styles.css'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 'image';
      document.head.appendChild(link);
    });
  }

  handleScroll() {
    // Animations au scroll
    const elements = document.querySelectorAll('.skill-card, .btn');
    elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight - CONFIG.scrollOffset;
      
      if (isVisible) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  }

  handleResize() {
    // Recalcul des positions du système solaire
    this.initializeSolarSystem();
  }

  handleFocus(event) {
    event.target.style.outline = '2px solid var(--primary-color)';
    event.target.style.outlineOffset = '2px';
  }

  handleBlur(event) {
    event.target.style.outline = '';
    event.target.style.outlineOffset = '';
  }

  handleEscapeKey() {
    // Fermer les menus ouverts
    const navbar = document.querySelector('.navbar-collapse');
    if (navbar && navbar.classList.contains('show')) {
      navbar.classList.remove('show');
      const toggler = document.querySelector('.navbar-toggler');
      if (toggler) {
        toggler.setAttribute('aria-expanded', 'false');
      }
    }
  }

  showFieldError(field, message) {
    this.clearFieldError(field);
    field.classList.add('is-invalid');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
  }

  clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
      errorDiv.remove();
    }
  }
}

// Initialisation de l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioApp();
});

// Support des modules ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PortfolioApp;
}
