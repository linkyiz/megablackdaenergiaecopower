/**
 * ============================================================================
 * MEGA BLACK DA ENERGIA - ECOPOWER ENERGIA SOLAR
 * Lógica do Formulário, Máscaras, Slider e Integração WhatsApp
 * ============================================================================
 */

if (window.__ECOPOWER_SCRIPT_INITIALIZED__) {
  // Script já inicializado, evita execução duplicada
} else {
  window.__ECOPOWER_SCRIPT_INITIALIZED__ = true;

  document.addEventListener('DOMContentLoaded', () => {
  // Constantes
  const WHATSAPP_NUMBER = '5517996657199'; // +55 17 99665-7199

  // Elementos do DOM
  const form = document.getElementById('leadForm');
  const btnPf = document.getElementById('btn-pf');
  const btnPj = document.getElementById('btn-pj');
  const labelNome = document.getElementById('label-nome');
  const inputNome = document.getElementById('nome');
  const inputWhatsapp = document.getElementById('whatsapp');
  const inputCidade = document.getElementById('cidade');
  const inputUf = document.getElementById('uf');
  const labelDoc = document.getElementById('label-doc');
  const inputDoc = document.getElementById('documento');

  // Slider
  const slider = document.getElementById('energiaSlider');
  const sliderText = document.getElementById('sliderValueText');
  const sliderProgress = document.getElementById('sliderProgress');

  // Modal LGPD
  const privacyModal = document.getElementById('privacyModal');
  const openPrivacyBtn = document.getElementById('openPrivacyModal');
  const closePrivacyBtn = document.getElementById('closePrivacyModal');
  const confirmPrivacyBtn = document.getElementById('confirmPrivacyModal');

  // Estado atual
  let currentPersonType = 'PF'; // 'PF' ou 'PJ'

  /* --------------------------------------------------------------------------
     0. Ciclo Dinâmico dos Botões de Condição (Destaque a cada 1 segundo)
     Todos os botões adotam o padrão do "30x sem juros" (texto grande laranja, menor branco).
     A cada 1 segundo, um botão se alterna para o estilo "financiamento facilitado" 
     (caixa em gradiente laranja sólido e todo texto em branco).
  -------------------------------------------------------------------------- */
  const badgeCards = document.querySelectorAll('.badge-card');
  let activeBadgeIndex = 0;
  let badgeCycleInterval = null;

  function setHighlightedBadge(index) {
    badgeCards.forEach((card, idx) => {
      if (idx === index) {
        card.classList.add('is-active-card');
      } else {
        card.classList.remove('is-active-card');
      }
    });
  }

  function startBadgeCycle() {
    if (badgeCycleInterval) clearInterval(badgeCycleInterval);
    badgeCycleInterval = setInterval(() => {
      activeBadgeIndex = (activeBadgeIndex + 1) % badgeCards.length;
      setHighlightedBadge(activeBadgeIndex);
    }, 1000);
  }

  function stopBadgeCycle() {
    if (badgeCycleInterval) {
      clearInterval(badgeCycleInterval);
      badgeCycleInterval = null;
    }
  }

  // Inicia o ciclo dinâmico
  setHighlightedBadge(activeBadgeIndex);
  startBadgeCycle();

  // Pausa no hover para o usuário inspecionar
  const badgesContainer = document.getElementById('badgesRow');
  if (badgesContainer) {
    badgesContainer.addEventListener('mouseenter', stopBadgeCycle);
    badgesContainer.addEventListener('mouseleave', startBadgeCycle);

    badgeCards.forEach((card, idx) => {
      card.addEventListener('mouseenter', () => {
        setHighlightedBadge(idx);
        activeBadgeIndex = idx;
      });
    });
  }

  /* --------------------------------------------------------------------------
     1. Alternância entre Pessoa Física e Jurídica
  -------------------------------------------------------------------------- */
  function setPersonType(type) {
    currentPersonType = type;

    if (type === 'PF') {
      btnPf.classList.add('active');
      btnPf.setAttribute('aria-checked', 'true');
      btnPj.classList.remove('active');
      btnPj.setAttribute('aria-checked', 'false');

      labelNome.textContent = 'Nome completo';
      inputNome.placeholder = 'Digite seu nome';
      labelDoc.textContent = 'CPF';
      inputDoc.placeholder = '000.000.000-00';
      inputDoc.maxLength = 14;
    } else {
      btnPj.classList.add('active');
      btnPj.setAttribute('aria-checked', 'true');
      btnPf.classList.remove('active');
      btnPf.setAttribute('aria-checked', 'false');

      labelNome.textContent = 'Razão Social / Empresa';
      inputNome.placeholder = 'Digite o nome da empresa';
      labelDoc.textContent = 'CNPJ';
      inputDoc.placeholder = '00.000.000/0000-00';
      inputDoc.maxLength = 18;
    }

    // Limpa erro e reaplica máscara no documento
    clearError('documento');
    inputDoc.value = formatDocument(inputDoc.value, currentPersonType);
  }

  btnPf.addEventListener('click', () => setPersonType('PF'));
  btnPj.addEventListener('click', () => setPersonType('PJ'));

  /* --------------------------------------------------------------------------
     2. Máscaras Dinâmicas
  -------------------------------------------------------------------------- */

  // Máscara WhatsApp / Telefone BR: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  function formatWhatsApp(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (!digits) return '';

    if (digits.length <= 2) {
      return `(${digits}`;
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  inputWhatsapp.addEventListener('input', (e) => {
    e.target.value = formatWhatsApp(e.target.value);
    clearError('whatsapp');
  });

  // Máscara UF: apenas 2 letras maiúsculas
  inputUf.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
    clearError('uf');
  });

  // Máscara CPF (11 dígitos) e CNPJ (14 dígitos)
  function formatDocument(value, type) {
    const digits = value.replace(/\D/g, '');

    if (type === 'PF') {
      // CPF: 000.000.000-00
      const d = digits.slice(0, 11);
      if (d.length <= 3) return d;
      if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
      if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
      return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
    } else {
      // CNPJ: 00.000.000/0000-00
      const d = digits.slice(0, 14);
      if (d.length <= 2) return d;
      if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
      if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
      if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
      return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
    }
  }

  inputDoc.addEventListener('input', (e) => {
    e.target.value = formatDocument(e.target.value, currentPersonType);
    clearError('documento');

    // Validação em tempo real ao terminar de preencher
    const digits = e.target.value.replace(/\D/g, '');
    if (currentPersonType === 'PF' && digits.length === 11) {
      if (!validarCPF(digits)) {
        showError('documento', 'CPF inválido. Verifique os números');
      } else {
        clearError('documento');
      }
    } else if (currentPersonType === 'PJ' && digits.length === 14) {
      if (!validarCNPJ(digits)) {
        showError('documento', 'CNPJ inválido. Verifique os números');
      } else {
        clearError('documento');
      }
    }
  });

  inputDoc.addEventListener('blur', () => {
    const digits = inputDoc.value.replace(/\D/g, '');
    if (!digits) return;

    if (currentPersonType === 'PF') {
      if (digits.length < 11) {
        showError('documento', 'CPF incompleto (11 dígitos)');
      } else if (!validarCPF(digits)) {
        showError('documento', 'CPF inválido. Verifique os números');
      } else {
        clearError('documento');
      }
    } else {
      if (digits.length < 14) {
        showError('documento', 'CNPJ incompleto (14 dígitos)');
      } else if (!validarCNPJ(digits)) {
        showError('documento', 'CNPJ inválido. Verifique os números');
      } else {
        clearError('documento');
      }
    }
  });

  inputNome.addEventListener('input', () => clearError('nome'));
  inputCidade.addEventListener('input', () => clearError('cidade'));

  /* --------------------------------------------------------------------------
     3. Controle Deslizante (Slider de Valor de Energia)
     Mínimo: R$ 50 | Máximo: +R$ 1.000 | Passos de 50 em 50
  -------------------------------------------------------------------------- */
  function updateSliderDisplay() {
    const val = parseInt(slider.value, 10);
    const min = parseInt(slider.min, 10);
    const max = parseInt(slider.max, 10);

    // Formatação do texto de exibição
    if (val === min) {
      sliderText.textContent = 'Até R$ 50';
    } else if (val >= max) {
      sliderText.textContent = '+ R$1.000';
    } else {
      sliderText.textContent = `R$ ${val.toLocaleString('pt-BR')}`;
    }

    // Atualiza a barra de progresso colorida
    const percentage = ((val - min) / (max - min)) * 100;
    sliderProgress.style.width = `${percentage}%`;
  }

  slider.addEventListener('input', updateSliderDisplay);
  updateSliderDisplay(); // Inicializa na carga

  /* --------------------------------------------------------------------------
     4. Validações do Formulário
  -------------------------------------------------------------------------- */
  function showError(fieldId, message) {
    const errSpan = document.getElementById(`error-${fieldId}`);
    const input = document.getElementById(fieldId);
    if (errSpan) errSpan.textContent = message;
    if (input) {
      input.style.borderColor = '#ff5252';
      input.style.boxShadow = '0 0 10px rgba(255, 82, 82, 0.4)';
    }
  }

  function clearError(fieldId) {
    const errSpan = document.getElementById(`error-${fieldId}`);
    const input = document.getElementById(fieldId);
    if (errSpan) errSpan.textContent = '';
    if (input) {
      input.style.borderColor = '';
      input.style.boxShadow = '';
    }
  }

  /* --------------------------------------------------------------------------
     Algoritmo Oficial da Receita Federal (Módulo 11) para Validação de CPF
     Verifica sequências inválidas conhecidas e calcula os 2 dígitos verificadores
  -------------------------------------------------------------------------- */
  function validarCPF(cpf) {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) return false;

    // Rejeita sequências de números repetidos (ex: 00000000000, 11111111111, etc.)
    if (/^(\d)\1{10}$/.test(clean)) return false;

    // Primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(clean.charAt(i), 10) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(clean.charAt(9), 10)) return false;

    // Segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(clean.charAt(i), 10) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(clean.charAt(10), 10)) return false;

    return true;
  }

  /* --------------------------------------------------------------------------
     Algoritmo Oficial da Receita Federal para Validação de CNPJ
  -------------------------------------------------------------------------- */
  function validarCNPJ(cnpj) {
    const clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14) return false;

    // Rejeita sequências repetidas
    if (/^(\d)\1{13}$/.test(clean)) return false;

    // Primeiro dígito verificador
    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma = 0;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(clean.charAt(i), 10) * pesos1[i];
    }
    let resto = soma % 11;
    const digito1 = resto < 2 ? 0 : 11 - resto;
    if (digito1 !== parseInt(clean.charAt(12), 10)) return false;

    // Segundo dígito verificador
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    soma = 0;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(clean.charAt(i), 10) * pesos2[i];
    }
    resto = soma % 11;
    const digito2 = resto < 2 ? 0 : 11 - resto;
    if (digito2 !== parseInt(clean.charAt(13), 10)) return false;

    return true;
  }

  function validateForm() {
    let isValid = true;

    // Nome
    const nomeVal = inputNome.value.trim();
    if (!nomeVal || nomeVal.length < 3) {
      showError('nome', 'Por favor, digite seu nome completo');
      isValid = false;
    } else {
      clearError('nome');
    }

    // WhatsApp
    const waDigits = inputWhatsapp.value.replace(/\D/g, '');
    if (waDigits.length < 10) {
      showError('whatsapp', 'WhatsApp inválido com DDD (ex: 17 99999-9999)');
      isValid = false;
    } else {
      clearError('whatsapp');
    }

    // Cidade
    const cidadeVal = inputCidade.value.trim();
    if (!cidadeVal || cidadeVal.length < 2) {
      showError('cidade', 'Informe sua cidade');
      isValid = false;
    } else {
      clearError('cidade');
    }

    // UF
    const ufVal = inputUf.value.trim();
    if (!ufVal || ufVal.length !== 2) {
      showError('uf', 'UF (2 letras)');
      isValid = false;
    } else {
      clearError('uf');
    }

    // CPF / CNPJ com Validação Rigorosa dos Dígitos Verificadores
    const docDigits = inputDoc.value.replace(/\D/g, '');
    if (currentPersonType === 'PF') {
      if (!docDigits) {
        showError('documento', 'Informe seu CPF');
        isValid = false;
      } else if (docDigits.length !== 11) {
        showError('documento', 'CPF incompleto (deve conter 11 dígitos)');
        isValid = false;
      } else if (!validarCPF(docDigits)) {
        showError('documento', 'CPF inválido. Verifique os números digitados');
        isValid = false;
      } else {
        clearError('documento');
      }
    } else {
      if (!docDigits) {
        showError('documento', 'Informe o CNPJ da empresa');
        isValid = false;
      } else if (docDigits.length !== 14) {
        showError('documento', 'CNPJ incompleto (deve conter 14 dígitos)');
        isValid = false;
      } else if (!validarCNPJ(docDigits)) {
        showError('documento', 'CNPJ inválido. Verifique os números digitados');
        isValid = false;
      } else {
        clearError('documento');
      }
    }

    return isValid;
  }

  /* --------------------------------------------------------------------------
     5. Envio do Lead para o WhatsApp
  -------------------------------------------------------------------------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Foca no primeiro campo com erro
      const firstInvalid = form.querySelector('input[style*="rgb(255, 82, 82)"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;

    // Feedback visual no botão
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="cta-text" style="display:flex; align-items:center; gap:8px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.3"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg>
        GERANDO SUA CONDIÇÃO...
      </span>
    `;

    // Monta a mensagem para o WhatsApp
    const tipo = currentPersonType === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica';
    const nome = inputNome.value.trim();
    const whatsapp = inputWhatsapp.value.trim();
    const localizacao = `${inputCidade.value.trim()} - ${inputUf.value.trim()}`;
    const documento = `${currentPersonType === 'PF' ? 'CPF' : 'CNPJ'}: ${inputDoc.value.trim()}`;
    const valorEnergia = sliderText.textContent;

    const mensagem = [
      `☀️ *SOLICITAÇÃO DE SIMULAÇÃO - MEGA BLACK ECOPOWER* ☀️`,
      ``,
      `Olá! Preenchi o formulário da campanha *Mega Black da Energia* e tenho interesse em solicitar uma simulação personalizada e verificar a viabilidade das condições de financiamento (sujeitas à análise de crédito e viabilidade técnica).`,
      ``,
      `📋 *DADOS PARA ANÁLISE E CONTATO:*`,
      `• *Perfil:* ${tipo}`,
      `• *Nome/Razão Social:* ${nome}`,
      `• *WhatsApp:* ${whatsapp}`,
      `• *Cidade/UF:* ${localizacao}`,
      `• *${documento}*`,
      `• *Média aproximada da conta:* ${valorEnergia}`,
      `• *Sorteio da Live:* ✅ Cadastro finalizado para concorrer aos brindes!`,
      ``,
      `Solicito o atendimento de um consultor EcoPower para apresentação de proposta comercial sem compromisso.`
    ].join('\n');

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;

    // Pequeno delay para transição suave e feedback do usuário
    setTimeout(() => {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }, 700);
  });

  /* --------------------------------------------------------------------------
     6. Modal de Aviso de Privacidade e LGPD
  -------------------------------------------------------------------------- */
  function openModal() {
    privacyModal.classList.add('open');
    privacyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    privacyModal.classList.remove('open');
    privacyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openPrivacyBtn.addEventListener('click', openModal);
  closePrivacyBtn.addEventListener('click', closeModal);
  confirmPrivacyBtn.addEventListener('click', closeModal);

  privacyModal.addEventListener('click', (e) => {
    if (e.target === privacyModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && privacyModal.classList.contains('open')) {
      closeModal();
    }
  });

  /* --------------------------------------------------------------------------
     7. Efeito de Crescimento dos Big Numbers (Count-Up Animation)
     Faz os números subirem suavemente de 0 até o valor final com easing fluido
  -------------------------------------------------------------------------- */
  function animateCountUp() {
    const counterElements = document.querySelectorAll('.count-up');
    if (!counterElements.length) return;

    const duration = 2000; // 2 segundos
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: easeOutExpo para desaceleração natural e impactante
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      counterElements.forEach((el) => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const currentVal = Math.round(easeOut * target);

        const prefixHtml = prefix ? `<span class="stat-prefix">${prefix}</span>` : '';
        const suffixHtml = suffix ? `<span class="stat-suffix">${suffix}</span>` : '';
        el.innerHTML = `${prefixHtml}${currentVal}${suffixHtml}`;
      });

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counterElements.forEach((el) => {
          const target = el.getAttribute('data-target');
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const prefixHtml = prefix ? `<span class="stat-prefix">${prefix}</span>` : '';
          const suffixHtml = suffix ? `<span class="stat-suffix">${suffix}</span>` : '';
          el.innerHTML = `${prefixHtml}${target}${suffixHtml}`;
        });
      }
    }

    requestAnimationFrame(updateCounter);
  }

  // Inicia a contagem crescente suave
  setTimeout(animateCountUp, 500);

  /* --------------------------------------------------------------------------
     8. Contador Dinâmico de Propostas da Live (Persistente e Real-time)
     Inicia a partir de 30 e soma +1 a cada 20 segundos de forma contínua.
     Ao recarregar a página, calcula o tempo transcorrido e mantém a contagem
     sem nunca reiniciar do zero.
  -------------------------------------------------------------------------- */
  const proposalsCounterEl = document.getElementById('proposalsCounter');
  if (proposalsCounterEl) {
    const STORAGE_KEY_COUNT = 'ecopower_live_proposals_count';
    const STORAGE_KEY_TIME = 'ecopower_live_proposals_time';
    const BASE_PROPOSALS = 30;
    const INTERVAL_MS = 20000; // 20 segundos

    function getSynchronizedProposals() {
      const now = Date.now();
      const storedCount = parseInt(localStorage.getItem(STORAGE_KEY_COUNT), 10);
      const storedTime = parseInt(localStorage.getItem(STORAGE_KEY_TIME), 10);

      // Primeira visita
      if (!storedCount || isNaN(storedCount) || !storedTime || isNaN(storedTime)) {
        localStorage.setItem(STORAGE_KEY_COUNT, BASE_PROPOSALS);
        localStorage.setItem(STORAGE_KEY_TIME, now);
        return BASE_PROPOSALS;
      }

      // Calcula quantos blocos de 20 segundos se passaram
      const elapsedMs = Math.max(0, now - storedTime);
      const incrementsPassed = Math.floor(elapsedMs / INTERVAL_MS);
      const currentCount = storedCount + incrementsPassed;

      // Preserva a fração de tempo restante para a próxima adição de 20s
      const remainderMs = elapsedMs % INTERVAL_MS;
      localStorage.setItem(STORAGE_KEY_COUNT, currentCount);
      localStorage.setItem(STORAGE_KEY_TIME, now - remainderMs);

      return currentCount;
    }

    let currentProposals = getSynchronizedProposals();
    proposalsCounterEl.textContent = currentProposals;

    // Atualização contínua a cada 20 segundos com animação de pulso
    setInterval(() => {
      currentProposals += 1;
      localStorage.setItem(STORAGE_KEY_COUNT, currentProposals);
      localStorage.setItem(STORAGE_KEY_TIME, Date.now());

      proposalsCounterEl.textContent = currentProposals;
      proposalsCounterEl.classList.add('bump');
      setTimeout(() => {
        proposalsCounterEl.classList.remove('bump');
      }, 400);
    }, INTERVAL_MS);
  }
});

// Animação de rotação para spinner do botão
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);
}
