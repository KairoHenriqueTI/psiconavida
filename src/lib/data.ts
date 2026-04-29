import type { BlogPost, Category } from "./types";

import categoryAutoconhecimento from "@/assets/category-autoconhecimento.jpg";
import categoryEstudos from "@/assets/category-estudos.jpg";
import categoryRelacoes from "@/assets/category-relacoes.jpg";
import categoryBemestar from "@/assets/category-bemestar.jpg";

export const categories: Category[] = [
  {
    name: "Autoconhecimento",
    slug: "autoconhecimento",
    description: "Reflexões e práticas para entender melhor quem você é.",
    image: categoryAutoconhecimento,
    postCount: 5,
  },
  {
    name: "Estudos & Produtividade",
    slug: "estudos-produtividade",
    description: "Dicas para organizar a rotina e potencializar os estudos.",
    image: categoryEstudos,
    postCount: 4,
  },
  {
    name: "Relações Humanas",
    slug: "relacoes-humanas",
    description: "Psicologia aplicada aos vínculos e relações do dia a dia.",
    image: categoryRelacoes,
    postCount: 3,
  },
  {
    name: "Bem-estar & Saúde Mental",
    slug: "bem-estar-saude-mental",
    description: "Cuidar da mente para viver com mais equilíbrio e leveza.",
    image: categoryBemestar,
    postCount: 4,
  },
];

export const posts: BlogPost[] = [
  {
    id: "1",
    slug: "psicologia-no-cotidiano-como-comecar",
    title: "Psicologia no cotidiano: como começar a aplicar no seu dia a dia",
    excerpt: "A psicologia não precisa ser algo distante. Descubra como pequenas mudanças de perspectiva podem transformar sua rotina e suas relações.",
    content: `<p>Quando pensamos em psicologia, muitas vezes imaginamos algo restrito a consultórios e livros acadêmicos. Mas a verdade é que a psicologia está presente em cada decisão que tomamos, em cada conversa que temos, em cada emoção que sentimos.</p>
    
<h2>O que significa "respirar psicologia"?</h2>
<p>Respirar psicologia é integrar o saber psicológico às pequenas coisas do dia a dia. É perceber seus padrões de comportamento, entender por que certas situações te afetam mais do que outras, e usar esse conhecimento para viver de forma mais consciente.</p>

<h2>Três passos para começar hoje</h2>
<p><strong>1. Observe sem julgar:</strong> Reserve alguns minutos do seu dia para simplesmente observar seus pensamentos e emoções. Não tente mudá-los — apenas note.</p>
<p><strong>2. Nomeie suas emoções:</strong> Pesquisas mostram que o simples ato de nomear o que sentimos reduz a intensidade emocional. Em vez de "estou mal", tente "estou frustrada porque...".</p>
<p><strong>3. Pratique a escuta ativa:</strong> Na próxima conversa, foque em realmente ouvir o outro, sem planejar sua resposta enquanto ele fala.</p>

<h2>Psicologia acessível é psicologia viva</h2>
<p>A Psiconavida existe justamente para isso: tornar a psicologia algo vivo, presente e acessível. Não é sobre simplificar demais, mas sobre traduzir o conhecimento de forma que ele faça sentido no seu cotidiano.</p>

<p>Comece hoje. Respire psicologia.</p>`,
    category: "Autoconhecimento",
    categorySlug: "autoconhecimento",
    date: "2026-03-08",
    readTime: "5 min",
    image: categoryAutoconhecimento,
  },
  {
    id: "2",
    slug: "como-organizar-estudos-com-equilibrio",
    title: "Como organizar seus estudos com equilíbrio emocional",
    excerpt: "Estudar com eficiência vai além de técnicas — envolve cuidar da mente. Veja como a psicologia pode te ajudar a estudar melhor.",
    content: `<p>Muitos estudantes buscam a técnica perfeita de estudo, mas esquecem que o estado emocional influencia diretamente na capacidade de aprender.</p>

<h2>A mente precisa estar preparada</h2>
<p>Antes de abrir o caderno, pergunte-se: como estou me sentindo agora? Ansiedade, cansaço e frustração são barreiras invisíveis para o aprendizado.</p>

<h2>Dicas práticas</h2>
<p><strong>Crie rituais de transição:</strong> Antes de estudar, faça algo que sinalize ao seu cérebro que é hora de focar — um chá, uma respiração, organizar a mesa.</p>
<p><strong>Respeite seus limites:</strong> Estudar 12 horas seguidas não é produtividade — é exaustão. Use técnicas como Pomodoro adaptado ao seu ritmo.</p>
<p><strong>Celebre pequenas conquistas:</strong> Seu cérebro precisa de reforço positivo. Reconheça cada capítulo lido, cada conceito entendido.</p>`,
    category: "Estudos & Produtividade",
    categorySlug: "estudos-produtividade",
    date: "2026-03-05",
    readTime: "4 min",
    image: categoryEstudos,
  },
  {
    id: "3",
    slug: "escuta-ativa-nas-relacoes",
    title: "O poder da escuta ativa nas relações",
    excerpt: "Ouvir de verdade é um ato de cuidado. Entenda como a escuta ativa pode transformar seus relacionamentos.",
    content: `<p>Em um mundo cada vez mais acelerado, ouvir de verdade se tornou um ato raro — e profundamente transformador.</p>

<h2>O que é escuta ativa?</h2>
<p>Escuta ativa não é apenas ouvir palavras. É estar presente com o outro, com atenção plena, sem julgamentos e sem a pressa de responder.</p>

<h2>Como praticar</h2>
<p><strong>Faça contato visual:</strong> Olhe para a pessoa. Isso comunica presença e interesse genuíno.</p>
<p><strong>Reflita o que ouviu:</strong> Repita com suas palavras o que a pessoa disse. "Se entendi bem, você está dizendo que..."</p>
<p><strong>Valide as emoções:</strong> Antes de dar conselhos, reconheça o que o outro sente. "Faz sentido você se sentir assim."</p>`,
    category: "Relações Humanas",
    categorySlug: "relacoes-humanas",
    date: "2026-03-01",
    readTime: "4 min",
    image: categoryRelacoes,
  },
  {
    id: "4",
    slug: "respiracao-como-ferramenta-emocional",
    title: "Respiração como ferramenta de regulação emocional",
    excerpt: "Técnicas simples de respiração podem ajudar a regular emoções, reduzir ansiedade e trazer clareza mental.",
    content: `<p>A respiração é a ponte entre o corpo e a mente. Quando aprendemos a usá-la conscientemente, ganhamos uma ferramenta poderosa de autorregulação.</p>

<h2>Por que a respiração importa?</h2>
<p>O sistema nervoso responde diretamente ao padrão respiratório. Respirações curtas e rápidas ativam o modo "luta ou fuga". Respirações longas e profundas ativam o modo de descanso e recuperação.</p>

<h2>Técnica 4-7-8</h2>
<p><strong>Inspire por 4 segundos.</strong> Segure por 7. Expire lentamente por 8. Repita 3 vezes.</p>
<p>Essa técnica simples pode ser feita em qualquer lugar — antes de uma prova, em um momento de ansiedade, ou simplesmente para começar o dia com mais clareza.</p>`,
    category: "Bem-estar & Saúde Mental",
    categorySlug: "bem-estar-saude-mental",
    date: "2026-02-25",
    readTime: "3 min",
    image: categoryBemestar,
  },
  {
    id: "5",
    slug: "autoconhecimento-e-identidade",
    title: "Autoconhecimento e identidade: quem sou eu, afinal?",
    excerpt: "A jornada do autoconhecimento é contínua. Reflexões sobre identidade, valores e o processo de se descobrir.",
    content: `<p>"Quem sou eu?" é talvez a pergunta mais antiga e mais atual da humanidade. Na psicologia, essa questão ganha contornos práticos e profundos.</p>

<h2>Identidade não é fixa</h2>
<p>A psicologia do desenvolvimento nos ensina que a identidade é um processo, não um destino. Estamos constantemente nos construindo e reconstruindo.</p>

<h2>Exercício de reflexão</h2>
<p>Pegue um caderno e responda: Quais são os 5 valores mais importantes para mim? Minhas ações diárias refletem esses valores?</p>
<p>Essa simples reflexão pode revelar desalinhamentos entre quem queremos ser e como estamos vivendo.</p>`,
    category: "Autoconhecimento",
    categorySlug: "autoconhecimento",
    date: "2026-02-20",
    readTime: "5 min",
    image: categoryAutoconhecimento,
  },
  {
    id: "6",
    slug: "ansiedade-nos-estudos",
    title: "Ansiedade nos estudos: como lidar sem paralisar",
    excerpt: "A ansiedade acadêmica é comum e pode ser enfrentada. Entenda o que está por trás e como agir.",
    content: `<p>Sentir ansiedade antes de provas ou apresentações é normal. O problema é quando ela paralisa, tira o sono e rouba a concentração.</p>

<h2>Entendendo a ansiedade acadêmica</h2>
<p>A ansiedade é, na verdade, um sistema de alerta. Ela diz: "isso é importante para mim". O desafio é calibrar essa resposta.</p>

<h2>Estratégias práticas</h2>
<p><strong>Quebre a tarefa em partes menores:</strong> O cérebro se sente menos ameaçado com tarefas pequenas e concretas.</p>
<p><strong>Fale sobre isso:</strong> Compartilhar suas preocupações com alguém de confiança reduz significativamente a ansiedade.</p>
<p><strong>Lembre-se:</strong> Você não precisa ser perfeito. Precisa ser consistente.</p>`,
    category: "Estudos & Produtividade",
    categorySlug: "estudos-produtividade",
    date: "2026-02-15",
    readTime: "4 min",
    image: categoryEstudos,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getPostsByCategory(categorySlug: string): BlogPost[] {
  return posts.filter((p) => p.categorySlug === categorySlug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
