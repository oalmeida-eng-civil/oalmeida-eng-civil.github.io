// Elementos DOM
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const filterBtns = document.querySelectorAll('.filter-btn');
const backToTop = document.getElementById('backToTop');
const modal = document.getElementById('projectModal');
const closeModal = document.querySelector('.close-modal');

// Elementos do modal principal para esconder/mostrar
const modalHeader = document.querySelector('.modal-header');
const modalBody = document.querySelector('.modal-body');
const modalMainImage = document.getElementById('modalMainImage');
const thumbnailGrid = document.getElementById('thumbnailGrid');

// Array para armazenar os projetos carregados
let projetos = [];

// Lista de pastas de projetos
const pastasProjetos = [
    'modelo_1',
    //'condominio_verde'
];

// Variáveis para controle
let projetoAtualNoModal = null;
let imagemAtualIndex = 0; // Índice da imagem atual no modal principal

// Função para carregar um projeto de um arquivo JSON
async function carregarProjeto(pasta) {
    try {
        const response = await fetch(`assets/images/projetos/${pasta}/info.json`);
        
        if (!response.ok) {
            console.warn(`Arquivo info.json não encontrado para: ${pasta}`);
            return null;
        }
        
        const projeto = await response.json();
        return projeto;
        
    } catch (error) {
        console.error(`Erro ao carregar projeto ${pasta}:`, error);
        return null;
    }
}

// Função para carregar todos os projetos
async function carregarTodosProjetos() {
    console.log('Carregando projetos dos arquivos JSON...');
    
    projetos = [];
    
    const promises = pastasProjetos.map(pasta => carregarProjeto(pasta));
    const projetosCarregados = await Promise.all(promises);
    
    projetosCarregados.forEach(projeto => {
        if (projeto) {
            projetos.push(projeto);
        }
    });
    
    if (projetos.length === 0) {
        console.error('Nenhum projeto foi carregado.');
        
        const portfolioGrid = document.getElementById('portfolioGrid');
        if (portfolioGrid) {
            portfolioGrid.innerHTML = `
                <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <h3>Erro ao carregar projetos</h3>
                    <p>Não foi possível carregar os projetos.</p>
                </div>
            `;
        }
        return;
    }
    
    console.log(`${projetos.length} projetos carregados dos arquivos JSON`);
    
    projetos.sort((a, b) => a.id - b.id);
    carregarPortfolio();
}

// Menu Mobile
menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    menuToggle.innerHTML = navMenu.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

// Fechar menu ao clicar em um link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        
        navLinks.forEach(item => item.classList.remove('active'));
        link.classList.add('active');
    });
});

// Filtro do Portfólio
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filtro = btn.getAttribute('data-filter');
        carregarPortfolio(filtro);
    });
});

// Carregar Portfólio
function carregarPortfolio(filtro = 'all') {
    const portfolioGrid = document.getElementById('portfolioGrid');
    
    portfolioGrid.innerHTML = '';
    
    if (projetos.length === 0) {
        portfolioGrid.innerHTML = `
            <div class="loading-message">
                <p>Carregando projetos...</p>
            </div>
        `;
        return;
    }
    
    const projetosFiltrados = filtro === 'all' 
        ? projetos 
        : projetos.filter(projeto => projeto.categoria === filtro);
    
    if (projetosFiltrados.length === 0) {
        portfolioGrid.innerHTML = `
            <div class="no-projects">
                <p>Nenhum projeto encontrado nesta categoria.</p>
            </div>
        `;
        return;
    }
    
    projetosFiltrados.forEach(projeto => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item';
        portfolioItem.setAttribute('data-category', projeto.categoria);
        portfolioItem.setAttribute('data-id', projeto.id);
        
        const descricaoTruncada = projeto.descricao.length > 100 
            ? projeto.descricao.substring(0, 100) + '...' 
            : projeto.descricao;
        
        portfolioItem.innerHTML = `
            <div class="portfolio-img">
                <img src="${projeto.imagem}" alt="${projeto.titulo}" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400/2c3e50/ffffff?text=Imagem+não+disponível';">
            </div>
            <div class="portfolio-info">
                <span class="portfolio-category">${projeto.categoria.charAt(0).toUpperCase() + projeto.categoria.slice(1)}</span>
                <h3 class="portfolio-title">${projeto.titulo}</h3>
                <p class="portfolio-description">${descricaoTruncada}</p>
                <button class="btn-view-more" data-id="${projeto.id}">
                    <i class="fas fa-images"></i> Ver mais fotos
                </button>
            </div>
        `;
        
        portfolioGrid.appendChild(portfolioItem);
    });
    
    document.querySelectorAll('.btn-view-more').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const projectId = parseInt(this.getAttribute('data-id'));
            abrirModalProjeto(projectId);
        });
    });
    
    document.querySelectorAll('.portfolio-item').forEach(item => {
        item.addEventListener('click', function() {
            const projectId = parseInt(this.getAttribute('data-id'));
            abrirModalProjeto(projectId);
        });
    });
}

// Função para abrir modal do projeto
function abrirModalProjeto(projectId) {
    const projeto = projetos.find(p => p.id === projectId);
    if (!projeto) return;
    
    projetoAtualNoModal = projeto;
    
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');
    const modalDescription = document.getElementById('modalDescription');
    
    modalTitle.textContent = projeto.titulo;
    modalCategory.textContent = projeto.categoria.charAt(0).toUpperCase() + projeto.categoria.slice(1);
    modalDescription.textContent = projeto.descricao;
    
    // Resetar índice para a primeira imagem
    imagemAtualIndex = 0;
    modalMainImage.src = projeto.imagem;
    modalMainImage.alt = projeto.titulo;
    
    // Adicionar evento de clique na imagem principal para abrir visualização
    modalMainImage.onclick = () => {
        // Abrir visualização começando na imagem atual
        abrirVisualizacaoImagem(projeto.imagens, imagemAtualIndex);
    };
    
    modalMainImage.onerror = function() {
        this.src = 'https://via.placeholder.com/800x600/2c3e50/ffffff?text=Imagem+não+disponível';
    };
    
    thumbnailGrid.innerHTML = '';
    
    projeto.imagens.forEach((imagem, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        thumbnail.setAttribute('data-index', index);
        
        const img = document.createElement('img');
        img.src = imagem;
        img.alt = `${projeto.titulo} - Foto ${index + 1}`;
        img.loading = 'lazy';
        
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/150x100/2c3e50/ffffff?text=Foto+' + (index + 1);
        };
        
        thumbnail.appendChild(img);
        
        if (index === 0) {
            thumbnail.classList.add('active');
        }
        
        // Evento de clique na miniatura: muda a imagem principal
        thumbnail.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Atualizar imagem principal
            modalMainImage.src = imagem;
            
            // Atualizar índice da imagem atual
            imagemAtualIndex = index;
            
            // Atualizar classe active
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        });
        
        // REMOVIDO: Evento de duplo clique
        
        thumbnailGrid.appendChild(thumbnail);
    });
    
    atualizarDetalhesProjeto(projeto.detalhes);
    
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
}

// Criar modal de visualização de imagem
const visualizacaoModal = document.createElement('div');
visualizacaoModal.id = 'visualizacaoImagem';
visualizacaoModal.style.cssText = `
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.95);
    z-index: 1200;
    align-items: center;
    justify-content: center;
`;

visualizacaoModal.innerHTML = `
    <div style="position: relative; max-width: 95%; max-height: 95%;">
        <span id="fecharVisualizacao" style="position: absolute; top: 10px; right: 20px; color: white; font-size: 35px; cursor: pointer; z-index: 1201;">&times;</span>
        <div style="display: flex; align-items: center; justify-content: center; max-height: 80vh; margin-bottom: 20px;">
            <img id="imagemVisualizacao" src="" alt="" style="max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 4px;">
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; color: white;">
            <button id="imagemAnterior" style="background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); color: white; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-chevron-left"></i>
            </button>
            <span id="contadorImagem" style="font-size: 18px; min-width: 80px; text-align: center;">1 / 1</span>
            <button id="proximaImagem" style="background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); color: white; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    </div>
`;

document.body.appendChild(visualizacaoModal);

// Variáveis para controle da visualização
let imagensAtuais = [];
let indiceAtual = 0;

// Função para abrir visualização de imagem
function abrirVisualizacaoImagem(imagens, indiceInicial = 0) {
    imagensAtuais = imagens;
    indiceAtual = indiceInicial;
    
    if (imagensAtuais.length === 0) return;
    
    // Garantir que o índice está dentro dos limites
    if (indiceAtual < 0) indiceAtual = 0;
    if (indiceAtual >= imagensAtuais.length) indiceAtual = imagensAtuais.length - 1;
    
    // Esconder elementos do modal principal
    if (modalHeader) modalHeader.style.display = 'none';
    if (modalBody) modalBody.style.display = 'none';
    if (closeModal) closeModal.style.display = 'none';
    
    // Atualizar imagem com o índice correto
    const imagemVisualizacao = document.getElementById('imagemVisualizacao');
    const contadorImagem = document.getElementById('contadorImagem');
    
    imagemVisualizacao.src = imagensAtuais[indiceAtual];
    imagemVisualizacao.alt = `Imagem ${indiceAtual + 1} de ${imagensAtuais.length}`;
    contadorImagem.textContent = `${indiceAtual + 1} / ${imagensAtuais.length}`;
    
    // Abrir modal
    visualizacaoModal.style.display = 'flex';
}

// Função para fechar visualização de imagem
function fecharVisualizacaoImagem() {
    visualizacaoModal.style.display = 'none';
    
    // Mostrar elementos do modal principal
    if (modalHeader) modalHeader.style.display = 'flex';
    if (modalBody) modalBody.style.display = 'block';
    if (closeModal) closeModal.style.display = 'block';
}

// Função para navegar entre imagens
function navegarImagem(direcao) {
    if (imagensAtuais.length === 0) return;
    
    indiceAtual += direcao;
    
    if (indiceAtual < 0) {
        indiceAtual = imagensAtuais.length - 1;
    } else if (indiceAtual >= imagensAtuais.length) {
        indiceAtual = 0;
    }
    
    const imagemVisualizacao = document.getElementById('imagemVisualizacao');
    const contadorImagem = document.getElementById('contadorImagem');
    
    imagemVisualizacao.src = imagensAtuais[indiceAtual];
    imagemVisualizacao.alt = `Imagem ${indiceAtual + 1} de ${imagensAtuais.length}`;
    contadorImagem.textContent = `${indiceAtual + 1} / ${imagensAtuais.length}`;
}

// Configurar eventos da visualização
document.getElementById('fecharVisualizacao').addEventListener('click', fecharVisualizacaoImagem);
document.getElementById('imagemAnterior').addEventListener('click', () => navegarImagem(-1));
document.getElementById('proximaImagem').addEventListener('click', () => navegarImagem(1));

// Fechar ao clicar fora da imagem
visualizacaoModal.addEventListener('click', (e) => {
    if (e.target === visualizacaoModal) {
        fecharVisualizacaoImagem();
    }
});

// Navegação por teclado
document.addEventListener('keydown', (e) => {
    if (visualizacaoModal.style.display === 'flex') {
        if (e.key === 'ArrowLeft') {
            navegarImagem(-1);
        } else if (e.key === 'ArrowRight') {
            navegarImagem(1);
        } else if (e.key === 'Escape') {
            fecharVisualizacaoImagem();
        }
    }
});

// Função para atualizar detalhes do projeto no modal
function atualizarDetalhesProjeto(detalhes) {
    const detailsContainer = document.querySelector('.project-details');
    if (!detailsContainer || !detalhes) return;
    
    detailsContainer.innerHTML = `
        <div class="detail-item">
            <i class="fas fa-ruler-combined"></i>
            <div>
                <h4>Área Construída</h4>
                <p>${detalhes.area}</p>
            </div>
        </div>
        <div class="detail-item">
            <i class="fas fa-calendar-alt"></i>
            <div>
                <h4>Ano de Conclusão</h4>
                <p>${detalhes.ano}</p>
            </div>
        </div>
        <div class="detail-item">
            <i class="fas fa-map-marker-alt"></i>
            <div>
                <h4>Localização</h4>
                <p>${detalhes.localizacao}</p>
            </div>
        </div>
        <div class="detail-item">
            <i class="fas fa-clock"></i>
            <div>
                <h4>Tempo de Execução</h4>
                <p>${detalhes.tempo}</p>
            </div>
        </div>
        <div class="detail-item">
            <i class="fas fa-user-tie"></i>
            <div>
                <h4>Responsável</h4>
                <p>${detalhes.responsavel}</p>
            </div>
        </div>
    `;
}

// Botão Voltar ao Topo
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Fechar modal principal
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
});

// Fechar modal ao clicar fora (principal)
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
});

// Scroll suave para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando portfólio...');
    
    // Verificar se estamos rodando via servidor
    if (window.location.protocol === 'file:') {
        console.error('ERRO: Este site deve ser executado através de um servidor HTTP');
        
        const portfolioGrid = document.getElementById('portfolioGrid');
        if (portfolioGrid) {
            portfolioGrid.innerHTML = `
                <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <h3>Erro de Configuração</h3>
                    <p>Este site precisa ser executado através de um servidor HTTP.</p>
                    <p>Use Live Server no VS Code ou similar.</p>
                </div>
            `;
        }
        return;
    }
    
    carregarTodosProjetos().then(() => {
        console.log('Portfólio inicializado com', projetos.length, 'projetos');
    }).catch(error => {
        console.error('Erro ao inicializar portfólio:', error);
    });
    
    // Ativar link da navegação baseado na seção visível
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');
        const scrollPos = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollPos >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
});