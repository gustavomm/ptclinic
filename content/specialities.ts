export type Speciality = {
  slug: string;
  title: string;
  cardTitle: string;
  image: string;
  /** Meta description. Must stay ≤160 chars. */
  summary: string;
  cardText: string;
  intro: string;
  forWhom: string[];
  howItWorks: string;
  faq: Array<{ question: string; answer: string }>;
  /** schema.org MedicalCondition name. */
  condition: string;
  /** Blog post slugs to cross-link. */
  relatedPosts: string[];
};

export const specialities: Speciality[] = [
  {
    slug: "fisioterapia-neurologica",
    title: "Fisioterapia Neurofuncional",
    cardTitle: "Neurofuncional",
    image: "/neuro.webp",
    summary:
      "Fisioterapia neurofuncional na Consolação e em Pinheiros. Reabilitação após AVC, lesão medular, Parkinson e cirurgias neurológicas. Também em domicílio.",
    cardText:
      "Recuperar marcha, equilíbrio e independência nas atividades do dia a dia, após AVC, lesão medular, Parkinson e cirurgias neurológicas.",
    intro:
      "Depois de um AVC, uma lesão medular ou com o Parkinson, a rotina muda. Nosso trabalho é devolver movimento, equilíbrio e independência, com objetivos definidos junto com você.",
    forWhom: [
      "Pacientes com lesões neurológicas: após AVC, lesão medular, esclerose múltipla, paralisia cerebral, lesões cerebrais traumáticas.",
      "Pacientes com distúrbios de movimento: doença de Parkinson, distonias e ataxias.",
      /*
        Aqui havia um item sobre crianças com atraso no desenvolvimento motor.
        Era a pergunta que a própria revisão levantou — "checar se a Vyvyan vai
        querer atender criança também antes de colocar no site" — e a resposta
        da clínica em 17/08/2026 foi não. A clínica não atende crianças, então o
        item saiu em vez de continuar no ar sem resposta.

        A respiratória diz "para adultos" em howItWorks e continua certa.
      */
      "Pacientes pós operatório: após cirurgias de coluna e cerebral.",
      "Adultos e idosos com comprometimento neuromuscular: podem apresentar sintomas como dor ou formigamento nos membros ou na face, fraqueza muscular, fadiga e cãibras.",
    ],
    howItWorks:
      "Você começa por uma avaliação detalhada da sua queixa. Definimos juntos onde queremos chegar e montamos um plano com técnicas e exercícios escolhidos especificamente para o seu caso. Ao longo do tratamento, reavaliamos e ajustamos conforme você evolui.",
    faq: [
      {
        question: "Quanto tempo dura a reabilitação neurofuncional?",
        answer:
          "Depende do quadro e do objetivo definido na avaliação inicial. Cada caso tem um ritmo, e por isso reavaliamos ao longo do tratamento e ajustamos o plano conforme a evolução. Na primeira sessão conversamos sobre o que é realista esperar.",
      },
      {
        question: "Quais condições neurológicas são atendidas?",
        answer:
          "AVC, lesão medular, esclerose múltipla, paralisia cerebral, lesões cerebrais traumáticas, doença de Parkinson, distonias e ataxias, entre outras.",
      },
      {
        question: "As sessões são individuais?",
        answer:
          "Sim. Todo atendimento é individual, do começo ao fim, sempre com a mesma fisioterapeuta. Você não divide o horário com outro paciente.",
      },
    ],
    condition: "Distúrbios neurológicos",
    relatedPosts: ["fisioterapia-apos-avc"],
  },
  {
    slug: "fisioterapia-oncologica",
    title: "Fisioterapia Oncológica",
    cardTitle: "Oncológica",
    image: "/onco.webp",
    summary:
      // Encurtada. A versão da revisão tinha 164 caracteres, e o limite de 160
      // é o que o Google mostra antes de cortar. Nenhuma palavra do conteúdo
      // saiu: só o "em São Paulo -" da abertura, que as outras quatro áreas
      // reescritas na mesma revisão também já não têm.
      "Fisioterapia oncológica na Consolação e em Pinheiros. Cuidado com linfedema, mobilidade de ombro, fadiga e força durante e depois do tratamento do câncer.",
    cardText:
      "Reabilitação durante e depois do tratamento oncológico: mobilidade, linfedema, fadiga e condicionamento.",
    intro:
      "Acompanhamos pacientes em todas as fases do tratamento oncológico. Antes, para preparar o corpo. Durante, para manejo dos efeitos colaterais do tratamento como fadiga, dor e linfedema. Depois, para recuperar mobilidade, força e autonomia.",
    forWhom: [
      "Pacientes em tratamento de câncer: que estão passando por quimioterapia, radioterapia, cirurgia ou terapia-alvo. Esses tratamentos podem causar efeitos colaterais que afetam a função física, como fadiga, fraqueza muscular, dor, rigidez articular e problemas de equilíbrio.",
      "Pacientes com linfedema: linfedema em perna ou braço, após tratamentos ginecológicos e de mama.",
      "Pacientes em recuperação pós-cirúrgica: O procedimento cirúrgico pode resultar em restrições de movimento, retração cicatricial, perda de força muscular e aumento da fadiga.",
      "Pacientes com dor crônica relacionada ao câncer: devido à progressão da doença ou aos efeitos colaterais do tratamento.",
      "Pacientes pós tratamento oncológico: que podem passar por fadiga persistente, fraqueza muscular, dificuldades de equilíbrio e alterações na composição corporal.",
    ],
    howItWorks:
      "Começamos por uma avaliação que considera a fase do tratamento, os procedimentos já realizados e os sintomas presentes. O plano é individualizado e reavaliado ao longo do percurso, porque a conduta muda conforme o tratamento avança, o que funciona durante a quimioterapia não é o mesmo que funciona depois da cirurgia.",
    faq: [
      {
        question: "A fisioterapia oncológica pode ser feita durante a quimioterapia ou radioterapia?",
        answer:
          "Sim, e é recomendável que seja feito nessa fase. A fisioterapia oncológica atende pacientes em todas as fases do tratamento contra o câncer, incluindo quimioterapia, radioterapia, cirurgia ou terapia-alvo, com foco na prevenção e alívio de efeitos colaterais como fadiga, fraqueza muscular, dor, rigidez articular e questões de equilíbrio.",
      },
      {
        question: "A fisioterapia oncológica trata linfedema?",
        answer:
          "Sim. Atendemos linfedema de braço e de perna após tratamentos de mama e ginecológicos, com drenagem, exercícios e orientação de cuidados para o dia a dia. Quanto antes começar, melhor o controle.",
      },
      {
        question: "Como são as sessões?",
        answer:
          "Individuais e conduzidas pela mesma fisioterapeuta do início ao fim. Cada sessão é ajustada ao seu momento no tratamento, respeitando fadiga, contagem sanguínea e como você chegou naquele dia.",
      },
    ],
    condition: "Câncer",
    relatedPosts: [
      "fisioterapia-oncologica-tratamento-cancer",
      "fisioterapia-cuidados-paliativos",
    ],
  },
  {
    slug: "fisioterapia-ortopedica",
    title: "Fisioterapia Ortopédica",
    cardTitle: "Ortopédica",
    image: "/ortop.webp",
    summary:
      "Fisioterapia ortopédica na Consolação e em Pinheiros: dor na coluna, ombro e joelho, reabilitação pós-operatória e lesões esportivas. Atendimento individual.",
    cardText:
      "Prevenir, tratar e reabilitar, de uma entorse ao pós-operatório, até você voltar ao que fazia antes.",
    intro:
      "De uma entorse a uma prótese de joelho. Tratamos dor, lesão e limitação de movimento em músculos, ossos, tendões e articulações, na fase aguda ou na recuperação de cirurgia.",
    forWhom: [
      "Pacientes com lesões musculoesqueléticas: como entorses, distensões musculares, tendinites, fraturas ósseas e lesões ligamentares.",
      "Pessoas com dor crônica ou aguda nas articulações: como artrite/osteoartrite, bursite, epicondilite e tendinite.",
      "Pacientes em processo de reabilitação pós-cirúrgica: cirurgias ortopédicas como a substituição total do joelho ou do quadril, reparo de ligamentos ou tendões, ou fixação de fraturas.",
      "Atletas com lesões esportivas: como entorses, contusões, distensões musculares e lesões nos ligamentos.",
      "Indivíduos com desordens posturais: como cifose, lordose ou escoliose. Podem apresentar dores nas costas, restrições de movimento e má postura.",
    ],
    howItWorks:
      "Primeiro, uma avaliação que testa movimento, força e função para entender de onde vem a dor. Depois, um plano com técnicas manuais e exercícios progressivos, ajustado conforme você evolui. O foco é na recuperação e na prevenção de futuras complicações.",
    faq: [
      {
        question: "Quais lesões a fisioterapia ortopédica trata?",
        answer:
          "Entorses, distensões musculares, tendinites, fraturas ósseas e lesões ligamentares, além de dor crônica ou aguda em articulações como artrite/osteoartrite, bursite e epicondilite.",
      },
      {
        question: "Atende reabilitação após cirurgia ortopédica?",
        answer:
          "Sim, inclusive após cirurgias como prótese de joelho ou quadril, reparo de ligamentos ou tendões e fixação de fraturas. Também atendemos no pré-operatório: chegar mais forte à cirurgia costuma facilitar a recuperação.",
      },
      {
        question: "Atende atletas com lesões esportivas?",
        answer:
          "Sim. Entorses, contusões, distensões e lesões ligamentares, do atleta de competição a quem corre no fim de semana ou treina na academia. O tratamento acompanha até o retorno seguro à modalidade.",
      },
    ],
    condition: "Lesões musculoesqueléticas",
    relatedPosts: [],
  },
  {
    slug: "fisioterapia-para-idosos",
    title: "Fisioterapia em Gerontologia",
    cardTitle: "Gerontologia",
    image: "/geronto.webp",
    summary:
      "Fisioterapia para idosos na Consolação e em Pinheiros: prevenção de quedas, equilíbrio e recuperação após internação. Também a domicílio.",
    cardText:
      "Prevenir quedas, recuperar equilíbrio e força, e devolver autonomia depois de internações e períodos de repouso.",
    intro:
      "A fisioterapia em gerontologia cuida da saúde, independência e qualidade de vida da pessoa idosa, com trabalho de equilíbrio, força muscular e mobilidade articular.",
    forWhom: [
      "Idosos com histórico de desequilíbrio e queda.",
      "Pacientes com doenças crônicas relacionadas à idade: como osteoartrite, osteoporose, doenças cardíacas e doenças respiratórias.",
      "Idosos em processo de reabilitação pós-hospitalar: esses pacientes podem apresentar fraqueza muscular, perda de mobilidade e limitações funcionais devido a doenças agudas ou procedimentos cirúrgicos.",
      "Pessoas com demência, doença de Alzheimer ou Parkinson.",
      "Idosos que desejam manter um estilo de vida ativo e saudável: prevenindo futuras complicações secundárias ao envelhecimento.",
    ],
    howItWorks:
      "A fisioterapia em gerontologia é voltada para o atendimento de idosos, visando promover a saúde, independência e qualidade de vida nessa fase da vida. Por meio de exercícios específicos, treinamento de equilíbrio, fortalecimento muscular e mobilidade articular, busca-se prevenir quedas, melhorar a funcionalidade, reduzir dores e promover o envelhecimento ativo.",
    faq: [
      {
        question: "A fisioterapia em gerontologia ajuda a prevenir quedas?",
        answer:
          "Sim, e é uma das intervenções mais bem estabelecidas na área. Avaliamos o risco de queda, treinamos equilíbrio e força, e orientamos as adaptações necessárias em casa como tapete, iluminação, apoio no banheiro, etc.",
      },
      {
        question: "Atende idosos com Parkinson ou Alzheimer?",
        answer: "Sim. Atendemos Parkinson, Alzheimer e outras demências. Nessas condições a fisioterapia trabalha manutenção: preservar marcha, equilíbrio e independência pelo maior tempo possível, e reduzir o risco de queda, que é o que costuma acelerar a perda de função.",
      },
      {
        question: "Serve para reabilitação após internação hospitalar?",
        answer:
          "Sim. Perda de força, dificuldade para andar e insegurança ao levantar são muito comuns depois de uma internação, mesmo curta. Começar cedo faz diferença, atendemos na clínica e também em domicílio, para quem ainda não tem condição de se deslocar.",
      },
    ],
    condition: "Envelhecimento e quedas",
    relatedPosts: [],
  },
  {
    slug: "fisioterapia-respiratoria",
    title: "Fisioterapia Respiratória",
    cardTitle: "Respiratória",
    image: "/resp.webp",
    summary:
      "Fisioterapia respiratória na Consolação e em Pinheiros: falta de ar, asma, enfisema, bronquite crônica e recuperação após internação. Também em domicílio.",
    cardText:
      "Melhorar capacidade respiratória e tolerância ao esforço, para voltar a caminhar, subir escada e fazer suas atividades sem ficar sem ar.",
    intro:
      "Quando subir uma escada ou atravessar a rua já cansa, a fisioterapia respiratória trabalha capacidade pulmonar, força muscular e tolerância ao esforço. Atendemos asma, DPOC, bronquite crônica, fibrose pulmonar e recuperação após internações.",
    forWhom: [
      "Adultos com doenças respiratórias crônicas: como asma, doença pulmonar obstrutiva crônica (DPOC), fibrose pulmonar e bronquiectasias.",
      "Pacientes em recuperação pós-cirúrgica: principalmente após cirurgias torácicas ou abdominais.",
      "Pessoas com limitações respiratórias devido ao envelhecimento: como redução da capacidade pulmonar, fraqueza muscular respiratória e diminuição da função pulmonar.",
      "Pacientes com falta de ar crônica: causada por doenças respiratórias, como DPOC, ou por outras condições, como insuficiência cardíaca congestiva.",
      "Pessoas com condições neuromusculares respiratórias: como esclerose lateral amiotrófica (ELA), distrofia muscular e lesões medulares.",
    ],
    howItWorks:
      "A fisioterapia respiratória para adultos é direcionada ao tratamento de distúrbios respiratórios, como doença pulmonar obstrutiva crônica (DPOC), asma, bronquite e fibrose pulmonar. Por meio de técnicas de reabilitação pulmonar, exercícios respiratórios e desobstrução brônquica, busca-se melhorar a capacidade pulmonar, a eficiência respiratória e a qualidade de vida dos pacientes.",
    faq: [
      {
        question: "A fisioterapia respiratória trata DPOC e asma?",
        answer:
          "Sim. Em asma, DPOC, fibrose pulmonar e bronquiectasias, o trabalho é de condicionamento: fortalecer a musculatura respiratória, melhorar o controle da respiração e aumentar o quanto você aguenta de esforço sem ficar sem ar.",
      },
      {
        question: "Serve para recuperação após cirurgia?",
        answer:
          "Sim, principalmente após cirurgias torácicas e abdominais. Nesses casos a respiração fica limitada pela dor, o pulmão não expande como deveria, favorecendo o acúmulo de secreção, e isso pode causar infecções. O trabalho da fisioterapia respiratória reduz esse risco e acelera a retomada da rotina.",
      },
      {
        question: "Funciona para quem tem falta de ar há meses/anos?",
        answer:
          "Sim. Falta de ar crônica por DPOC, fibrose ou insuficiência cardíaca costuma criar um ciclo: a pessoa evita esforço, perde condicionamento, e passa a cansar cada vez mais fácil. A fisioterapia trabalha justamente para quebrar esse ciclo.",
      },
    ],
    condition: "Doenças respiratórias crônicas",
    relatedPosts: ["fisioterapia-respiratoria-dpoc"],
  },
  {
    slug: "fisioterapia-pre-e-pos-cirurgica",
    title: "Fisioterapia Pré e Pós-Cirúrgica",
    cardTitle: "Pré e pós-cirúrgico",
    image: "/cond.webp",
    summary:
      "Fisioterapia pré e pós-operatória na Consolação e em Pinheiros: preparo antes da cirurgia e recuperação dos movimentos e força depois. Também a domicílio.",
    cardText:
      "Chegar mais forte à cirurgia e voltar mais rápido à rotina depois: em procedimentos ortopédicos, abdominais e cardíacos.",
    intro:
      "Quem chega mais forte à cirurgia costuma se recuperar melhor. Trabalhamos os dois momentos: o preparo antes, para você entrar no procedimento em melhores condições, e a reabilitação depois, para recuperar mobilidade, força e função o mais breve possível.",
    forWhom: [
      "Pacientes em preparação para cirurgia que desejem chegar em melhores condições para o procedimento, o que costuma facilitar a recuperação depois.",
      "Depois de cirurgia ortopédica: prótese de joelho ou quadril, reparo de ligamento, fixação de fratura: recuperar amplitude, força e marcha.",
      "Depois de cirurgia abdominal: retomar mobilidade e respiração eficiente, com progressão segura de esforço.",
      "Depois de cirurgia cardíaca: recuperação de condicionamento e retorno gradual às atividades, respeitando os limites do pós-operatório.",
    ],
    howItWorks:
      "A fisioterapia para condicionamento físico pré e pós cirúrgico tem como objetivo preparar o paciente antes de uma cirurgia, melhorando sua condição física e reduzindo o risco de complicações. Após a cirurgia, a fisioterapia auxilia na recuperação, restaurando a mobilidade, força muscular e função, além de reduzir o tempo de internação e acelerar o retorno às atividades cotidianas. Sempre alinhados às orientações do cirurgião e respeitando o tempo de cicatrização.",
    faq: [
      {
        question: "O que é a fisioterapia pré-cirúrgica?",
        answer:
          "É preparar o corpo para o que vem. Nas semanas anteriores à cirurgia, trabalhamos condicionamento, força e mobilidade, e já ensinamos os movimentos que você vai precisar fazer depois: levantar da cama, sentar, andar com apoio. Chegar treinado facilita bastante o pós.",
      },
      {
        question: "Quais cirurgias são atendidas no pós-operatório?",
        answer: "Atendemos pós-operatório de cirurgias ortopédicas, abdominais, cardíacas, neurológicas e oncológicas.",
      },
      {
        question: "O que a fisioterapia pós-cirúrgica ajuda a restaurar?",
        answer:
          "Movimento, força, confiança e a capacidade de fazer as coisas do dia a dia da forma mais segura e independente possível. O objetivo é você voltar à sua rotina (trabalho, esporte, tarefas de casa), com ou sem adaptações, de forma mais breve possível.",
      },
    ],
    condition: "Recuperação cirúrgica",
    relatedPosts: [],
  },
];

export function getSpeciality(slug: string): Speciality | undefined {
  return specialities.find((s) => s.slug === slug);
}
