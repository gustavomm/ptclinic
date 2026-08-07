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
      "Fisioterapia neurofuncional em São Paulo: recuperação de função motora e autonomia após AVC, lesão medular, Parkinson e cirurgias neurológicas.",
    cardText:
      "Recuperar função motora e autonomia após AVC, lesão medular, Parkinson e cirurgias neurológicas.",
    intro:
      "A fisioterapia neurofuncional trabalha a função motora e a qualidade de vida em distúrbios neurológicos, com avaliação individualizada e um objetivo de tratamento definido junto com o paciente.",
    forWhom: [
      "Pacientes com lesões neurológicas: após AVC, lesão medular, esclerose múltipla, paralisia cerebral, lesões cerebrais traumáticas.",
      "Pacientes com distúrbios de movimento: doença de Parkinson, distonias e ataxias.",
      "Crianças com atraso no desenvolvimento motor: como atrasos no início da marcha, dificuldades de equilíbrio e coordenação e atrasos na aquisição de habilidades motoras.",
      "Pacientes pós operatório: após cirurgias de coluna e cerebral.",
      "Adultos e idosos com comprometimento neuromuscular: podem apresentar sintomas como dor ou formigamento nos membros ou na face, fraqueza muscular, fadiga e cãibras.",
    ],
    howItWorks:
      "Uma avaliação detalhada e com foco na queixa será realizada e, junto com o paciente, definiremos um objetivo a ser atingido. Sendo assim, um tratamento específico e individualizado será realizado, por meio de técnicas e exercícios terapêuticos, buscando melhorar a funcionalidade, mobilidade, equilíbrio e qualidade de vida dos pacientes.",
    faq: [
      {
        question: "Quanto tempo dura a reabilitação neurofuncional?",
        answer:
          "Depende da lesão, do tempo desde o evento e do objetivo definido na avaliação inicial, feita antes do início do tratamento.",
      },
      {
        question: "Quais condições neurológicas são atendidas?",
        answer:
          "AVC, lesão medular, esclerose múltipla, paralisia cerebral, lesões cerebrais traumáticas, doença de Parkinson, distonias e ataxias, entre outras.",
      },
      {
        question: "As sessões são individuais?",
        answer:
          "Sim. Todo atendimento é individual, com avaliação prévia e a mesma fisioterapeuta acompanhando o caso.",
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
      "Fisioterapia oncológica em São Paulo: manejo dos efeitos colaterais do tratamento e reabilitação de pacientes com câncer, do diagnóstico à remissão.",
    cardText:
      "Manejar os efeitos colaterais do tratamento e apoiar a reabilitação de pacientes com câncer.",
    intro:
      "A fisioterapia oncológica acompanha pacientes em todas as fases do tratamento contra o câncer, da prevenção e alívio de sintomas como fadiga e dor até a reabilitação após cirurgias e outros procedimentos.",
    forWhom: [
      "Pacientes em tratamento de câncer: que estão passando por quimioterapia, radioterapia, cirurgia ou terapia-alvo. Esses tratamentos podem causar efeitos colaterais que afetam a função física, como fadiga, fraqueza muscular, dor, rigidez articular e problemas de equilíbrio.",
      "Pacientes com linfedema: linfedema em perna ou braço, após tratamentos ginecológicos e de mama.",
      "Pacientes em recuperação pós-cirúrgica: O procedimento cirúrgico pode resultar em restrições de movimento, retração cicatricial, perda de força muscular e aumento da fadiga.",
      "Pacientes com dor crônica relacionada ao câncer: devido à progressão da doença ou aos efeitos colaterais do tratamento.",
      "Pacientes pós tratamento oncológico: que podem passar por fadiga persistente, fraqueza muscular, dificuldades de equilíbrio e alterações na composição corporal.",
    ],
    howItWorks:
      "A fisioterapia oncológica tem como objetivo auxiliar pacientes em todas as fases do tratamento contra o câncer. Ela abrange desde a prevenção e alívio de sintomas, como fadiga e dor, até a reabilitação após cirurgias e outros procedimentos. A terapia é individualizada e visa promover a melhora da capacidade física, diminuição dos efeitos colaterais do tratamento e o suporte emocional durante todo o processo.",
    faq: [
      {
        question: "A fisioterapia oncológica pode ser feita durante a quimioterapia ou radioterapia?",
        answer:
          "Sim. Ela atende pacientes em todas as fases do tratamento contra o câncer, incluindo quimioterapia, radioterapia, cirurgia ou terapia-alvo, com foco na prevenção e alívio de efeitos colaterais como fadiga, fraqueza muscular, dor, rigidez articular e problemas de equilíbrio.",
      },
      {
        question: "A fisioterapia oncológica trata linfedema?",
        answer:
          "Sim, atende pacientes com linfedema em perna ou braço após tratamentos ginecológicos e de mama.",
      },
      {
        question: "Como são as sessões?",
        answer:
          "A terapia é individualizada, com avaliação prévia e a mesma fisioterapeuta acompanhando o caso.",
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
      "Fisioterapia ortopédica em São Paulo: tratamento de lesões musculoesqueléticas, dor articular, reabilitação pós-cirúrgica e lesões esportivas.",
    cardText:
      "Prevenir, tratar e reabilitar lesões e disfunções do sistema musculoesquelético, de entorses a cirurgias ortopédicas.",
    intro:
      "A fisioterapia ortopédica previne, trata e reabilita lesões e disfunções do sistema musculoesquelético, de entorses e tendinites a fraturas e cirurgias como a substituição de joelho ou quadril.",
    forWhom: [
      "Pacientes com lesões musculoesqueléticas: como entorses, distensões musculares, tendinites, fraturas ósseas e lesões ligamentares.",
      "Pessoas com dor crônica ou aguda nas articulações: como artrite/osteoartrite, bursite, epicondilite e tendinite.",
      "Pacientes em processo de reabilitação pós-cirúrgica: cirurgias ortopédicas como a substituição total do joelho ou do quadril, reparo de ligamentos ou tendões, ou fixação de fraturas.",
      "Atletas com lesões esportivas: como entorses, contusões, distensões musculares e lesões nos ligamentos.",
      "Indivíduos com desordens posturais: como cifose, lordose ou escoliose. Podem apresentar dores nas costas, restrições de movimento e má postura.",
    ],
    howItWorks:
      "A fisioterapia ortopédica é especializada no tratamento de lesões e disfunções do sistema musculoesquelético. Após avaliações precisas, são utilizadas técnicas terapêuticas, exercícios e reabilitação funcional para promover a recuperação e prevenir futuras complicações.",
    faq: [
      {
        question: "Quais lesões a fisioterapia ortopédica trata?",
        answer:
          "Entorses, distensões musculares, tendinites, fraturas ósseas e lesões ligamentares, além de dor crônica ou aguda em articulações como artrite/osteoartrite, bursite e epicondilite.",
      },
      {
        question: "Atende reabilitação após cirurgia ortopédica?",
        answer:
          "Sim, inclusive após cirurgias como substituição total do joelho ou do quadril, reparo de ligamentos ou tendões e fixação de fraturas.",
      },
      {
        question: "Atende atletas com lesões esportivas?",
        answer:
          "Sim, atletas com entorses, contusões, distensões musculares e lesões nos ligamentos também são atendidos.",
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
      "Fisioterapia em gerontologia em São Paulo: prevenção de quedas, reabilitação pós-hospitalar e cuidado de idosos com doenças crônicas ou neurológicas.",
    cardText:
      "Prevenir quedas, melhorar equilíbrio e mobilidade, e apoiar a recuperação de idosos após internações.",
    intro:
      "A fisioterapia em gerontologia cuida da saúde, independência e qualidade de vida da pessoa idosa, com trabalho de equilíbrio, força muscular e mobilidade articular.",
    forWhom: [
      "Idosos com problemas de equilíbrio e queda.",
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
          "O trabalho de treinamento de equilíbrio e fortalecimento muscular busca prevenir quedas em idosos com problemas de equilíbrio.",
      },
      {
        question: "Atende idosos com Parkinson ou Alzheimer?",
        answer: "Sim, atende pessoas com demência, doença de Alzheimer ou Parkinson.",
      },
      {
        question: "Serve para reabilitação após internação hospitalar?",
        answer:
          "Sim, atende idosos em processo de reabilitação pós-hospitalar, que podem apresentar fraqueza muscular, perda de mobilidade e limitações funcionais devido a doenças agudas ou procedimentos cirúrgicos.",
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
      "Fisioterapia respiratória em São Paulo: tratamento de asma, DPOC, fibrose pulmonar e outras doenças respiratórias crônicas, com reabilitação pulmonar.",
    cardText:
      "Melhorar a função pulmonar e aliviar sintomas de doenças respiratórias crônicas como asma, DPOC e fibrose pulmonar.",
    intro:
      "A fisioterapia respiratória trata distúrbios respiratórios como DPOC, asma, bronquite e fibrose pulmonar, com técnicas de reabilitação pulmonar, exercícios respiratórios e desobstrução brônquica.",
    forWhom: [
      "Indivíduos com doenças respiratórias crônicas: como asma, doença pulmonar obstrutiva crônica (DPOC), fibrose pulmonar e bronquiectasias.",
      "Pacientes em recuperação pós-cirúrgica: principalmente após cirurgias torácicas ou abdominais.",
      "Pessoas com limitações respiratórias devido ao envelhecimento: como redução da capacidade pulmonar, fraqueza muscular respiratória e diminuição da função pulmonar.",
      "Pacientes com falta de ar crônica: causada por doenças respiratórias, como DPOC, ou por outras condições, como insuficiência cardíaca congestiva.",
      "Indivíduos com condições neuromusculares respiratórias: como esclerose lateral amiotrófica (ELA), distrofia muscular e lesões medulares.",
    ],
    howItWorks:
      "A fisioterapia respiratória para adultos é direcionada ao tratamento de distúrbios respiratórios, como doença pulmonar obstrutiva crônica (DPOC), asma, bronquite e fibrose pulmonar. Por meio de técnicas de reabilitação pulmonar, exercícios respiratórios e desobstrução brônquica, busca-se melhorar a capacidade pulmonar, a eficiência respiratória e a qualidade de vida dos pacientes.",
    faq: [
      {
        question: "A fisioterapia respiratória trata DPOC e asma?",
        answer:
          "Sim, atende indivíduos com doenças respiratórias crônicas como asma, DPOC, fibrose pulmonar e bronquiectasias.",
      },
      {
        question: "Serve para recuperação após cirurgia?",
        answer:
          "Sim, atende pacientes em recuperação pós-cirúrgica, principalmente após cirurgias torácicas ou abdominais.",
      },
      {
        question: "Atende quem tem falta de ar crônica?",
        answer:
          "Sim, atende pacientes com falta de ar crônica causada por doenças respiratórias, como DPOC, ou por outras condições, como insuficiência cardíaca congestiva.",
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
      "Fisioterapia pré e pós-cirúrgica em São Paulo: preparo físico antes da cirurgia e recuperação de mobilidade e força após o procedimento.",
    cardText:
      "Preparar o corpo antes da cirurgia e apoiar a recuperação após procedimentos ortopédicos, abdominais e cardíacos.",
    intro:
      "A fisioterapia pré e pós-cirúrgica prepara o paciente antes de uma cirurgia, melhorando sua condição física, e depois auxilia na recuperação, restaurando mobilidade, força muscular e função.",
    forWhom: [
      "Pacientes em preparação para cirurgia: focando na melhoria do condicionamento cardiovascular, fortalecimento muscular e flexibilidade, preparando o corpo para o procedimento cirúrgico e ajudando a acelerar a recuperação pós-operatória.",
      "Pessoas que passaram por cirurgias ortopédicas.",
      "Indivíduos que passaram por cirurgias abdominais.",
      "Pacientes que se submeteram a cirurgias cardíacas.",
    ],
    howItWorks:
      "A fisioterapia para condicionamento físico pré e pós cirúrgico tem como objetivo preparar o paciente antes de uma cirurgia, melhorando sua condição física e reduzindo o risco de complicações. Após a cirurgia, a fisioterapia auxilia na recuperação, restaurando a mobilidade, força muscular e função, além de reduzir o tempo de internação e acelerar o retorno às atividades cotidianas.",
    faq: [
      {
        question: "O que é a fisioterapia pré-cirúrgica?",
        answer:
          "É a preparação do paciente antes de uma cirurgia, com foco em condicionamento cardiovascular, fortalecimento muscular e flexibilidade, ajudando a acelerar a recuperação pós-operatória.",
      },
      {
        question: "Quais cirurgias são atendidas no pós-operatório?",
        answer: "Cirurgias ortopédicas, abdominais e cardíacas.",
      },
      {
        question: "O que a fisioterapia pós-cirúrgica ajuda a restaurar?",
        answer:
          "A mobilidade, a força muscular e a função, além de reduzir o tempo de internação e acelerar o retorno às atividades cotidianas.",
      },
    ],
    condition: "Recuperação cirúrgica",
    relatedPosts: [],
  },
  {
    slug: "drenagem-linfatica",
    title: "Drenagem Linfática",
    cardTitle: "Drenagem linfática",
    image: "/drenagem.webp",
    summary:
      "Drenagem linfática em São Paulo: redução de inchaço, melhora da circulação e alívio de dores musculares, para linfedema, pós-operatório e gestantes.",
    cardText:
      "Reduzir inchaço, melhorar a circulação e aliviar dores musculares, para pós-operatório, gestantes e linfedema.",
    intro:
      "A drenagem linfática estimula o sistema linfático para eliminar líquidos retidos e melhorar a circulação, reduzindo o inchaço e aliviando dores musculares.",
    forWhom: [
      "Pessoas com edema linfático: como linfedema primário ou secundário, pós-operatório de cirurgias, traumatismos ou problemas circulatórios.",
      "Gestantes: durante a gravidez, o aumento da pressão uterina e hormonal pode levar à retenção de líquidos e ao inchaço nas pernas, tornozelos e pés.",
      "Pacientes em recuperação pós-cirúrgica: após procedimentos estéticos, como lipoaspiração ou abdominoplastia",
      "Indivíduos com estresse e fadiga: além dos benefícios físicos, a drenagem linfática também pode proporcionar alívio do estresse e da fadiga.",
    ],
    howItWorks:
      "A drenagem linfática é uma técnica terapêutica que estimula o sistema linfático, promovendo a eliminação de líquidos retidos, melhorando a circulação e proporcionando benefícios como a redução do inchaço, alívio de dores musculares e sensação de relaxamento.",
    faq: [
      {
        question: "A drenagem linfática trata linfedema?",
        answer:
          "Sim, atende pessoas com edema linfático, como linfedema primário ou secundário, pós-operatório de cirurgias, traumatismos ou problemas circulatórios.",
      },
      {
        question: "Gestantes podem fazer drenagem linfática?",
        answer:
          "Sim. Durante a gravidez, o aumento da pressão uterina e hormonal pode levar à retenção de líquidos e ao inchaço nas pernas, tornozelos e pés, quadro que a drenagem linfática ajuda a aliviar.",
      },
      {
        question: "Serve para recuperação após cirurgia estética?",
        answer:
          "Sim, atende pacientes em recuperação pós-cirúrgica após procedimentos estéticos, como lipoaspiração ou abdominoplastia.",
      },
    ],
    condition: "Linfedema",
    relatedPosts: ["fisioterapia-incontinencia-urinaria"],
  },
];

export function getSpeciality(slug: string): Speciality | undefined {
  return specialities.find((s) => s.slug === slug);
}
