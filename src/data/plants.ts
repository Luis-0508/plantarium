import type { Plant } from './types'

/*
 * Care values are typical indoor recommendations compiled from horticultural
 * references (RHS, ASPCA toxicity list, University extension sheets). They are
 * placeholder-quality: good for orientation, not a substitute for local advice.
 */

const spiderPlant: Plant = {
  id: 'gruenlilie',
  commonName: 'Grünlilie',
  englishName: 'Spider Plant',
  botanicalName: 'Chlorophytum comosum',
  swatch: '#7f9c3c',
  family: 'Spargelgewächse (Asparagaceae)',
  origin: 'Tropisches und südliches Afrika',
  summary:
    'Bildet dichte Rosetten schmaler, überhängender Blätter und schiebt lange Ausläufer mit Kindeln. Fleischige Speicherwurzeln machen sie verzeihend bei vergessenem Gießen.',
  care: {
    light: { min: 0.3, max: 0.8, ideal: 0.62 },
    lightNote: 'Hell ohne pralle Mittagssonne. Im Halbschatten verblasst die Panaschierung.',
    water: { min: 0.3, max: 0.6, ideal: 0.45 },
    waterNote: 'Obere 2–3 cm antrocknen lassen. Die Speicherwurzeln überbrücken Trockenphasen.',
    temperature: { ideal: { min: 18, max: 24 }, minimum: 10, maximum: 30 },
    humidity: { ideal: { min: 40, max: 60 }, tolerated: { min: 30, max: 80 } },
    growth: { level: 3, label: 'Schnell', perYearCm: { min: 20, max: 40 } },
    difficulty: 1,
    difficultyNote: 'Sehr robust. Braune Blattspitzen zeigen meist trockene Luft oder fluoridhaltiges Wasser.',
    toxicity: {
      cats: false,
      dogs: false,
      humans: false,
      note: 'Laut ASPCA ungiftig. Katzen knabbern gern daran – in größeren Mengen kann das den Magen reizen.',
    },
    soil: {
      description: 'Lockere Blumenerde mit mineralischem Anteil',
      mix: [
        { name: 'Blumenerde', share: 0.6 },
        { name: 'Perlite', share: 0.25 },
        { name: 'Kokosfaser', share: 0.15 },
      ],
      ph: { min: 6.0, max: 7.2 },
    },
    fertilizing: { interval: 'alle 2–3 Wochen', note: 'Von April bis September, halbe Dosis Grünpflanzendünger.' },
    repotting: {
      interval: 'jährlich',
      years: { min: 1, max: 2 },
      note: 'Die dicken Wurzeln können dünnwandige Töpfe sprengen. Bei Wurzeln an der Oberfläche umtopfen.',
    },
    schedule: { fertilize: [4, 5, 6, 7, 8, 9], repot: [3, 4] },
  },
  dimensions: { maxIndoorHeightCm: { min: 30, max: 45 }, maxSpreadCm: 60, specimenHeight: 0.34 },
  pot: { height: 0.15, radius: 0.095, color: '#b9b2a4' },
  roots: {
    structure: 'tuberous',
    structureLabel: 'Fleischige Speicherwurzeln',
    structureNote:
      'Weiße, bis bleistiftdicke Wurzeln mit spindelförmigen Verdickungen, die Wasser und Nährstoffe speichern. Sie füllen den Topf rasch vollständig aus.',
    depthCm: 13,
    spreadCm: 8,
    density: 5,
    waterloggingSensitivity: 3,
    recommendedPotDepthCm: { min: 15, max: 20 },
    model: { primaryCount: 26, thickness: 0.0045, branching: 0.35, tubers: true, color: '#efe8d2' },
  },
  anatomy: [
    {
      region: 'leaf',
      title: 'Blatt',
      text: 'Linealische, rinnige Blätter bis 45 cm. Der cremeweiße Mittelstreifen enthält kaum Chlorophyll – deshalb braucht die panaschierte Form mehr Licht.',
      anchor: [0.2, 0.2, 0.06],
    },
    {
      region: 'stem',
      title: 'Ausläufer',
      text: 'Kein echter Stamm: Die Grünlilie treibt lange Blütenstiele, an deren Enden Kindel mit eigenen Luftwurzeln entstehen.',
      anchor: [-0.3, 0.1, 0.12],
    },
    {
      region: 'crown',
      title: 'Rhizom & Herz',
      text: 'Aus dem kurzen Rhizom wachsen alle Blätter. Das Herz sollte nicht tiefer als zuvor in der Erde sitzen, sonst droht Fäulnis.',
      anchor: [0, 0.03, 0.02],
    },
    {
      region: 'soil',
      title: 'Substrat',
      text: 'Durchlässig und strukturstabil. Perlite verhindert, dass die fleischigen Wurzeln dauerhaft im Nassen stehen.',
      anchor: [0.08, -0.02, 0.06],
    },
    {
      region: 'roots',
      title: 'Speicherwurzeln',
      text: 'Die knollig verdickten Wurzeln speichern Wasser für Wochen. Sie sind der Grund, warum die Pflanze Gießpausen gut verträgt.',
      anchor: [0.05, -0.1, 0.07],
    },
  ],
  model: {
    kind: 'procedural',
    generator: 'rosette',
    seed: 7,
    params: { type: 'rosette', leafCount: 58, leafLength: 0.42, leafWidth: 0.0095, variegation: 0.34, runners: 3 },
  },
}

const arecaPalm: Plant = {
  id: 'goldfruchtpalme',
  commonName: 'Goldfruchtpalme',
  englishName: 'Areca Palm',
  botanicalName: 'Dypsis lutescens',
  swatch: '#b08a22',
  family: 'Palmengewächse (Arecaceae)',
  origin: 'Ostmadagaskar',
  summary:
    'Mehrstämmige Palme mit goldgelben, geringelten Stämmen und weich überhängenden Fiederwedeln. Wächst in Horsten und wirkt dadurch buschig.',
  care: {
    light: { min: 0.5, max: 0.9, ideal: 0.74 },
    lightNote: 'Sehr hell, gern mit Morgen- oder Abendsonne. Zu dunkel wird sie licht und blass.',
    water: { min: 0.5, max: 0.75, ideal: 0.62 },
    waterNote: 'Gleichmäßig feucht halten, nie nass. Kalkarmes, zimmerwarmes Wasser verwenden.',
    temperature: { ideal: { min: 18, max: 27 }, minimum: 15, maximum: 32 },
    humidity: { ideal: { min: 50, max: 70 }, tolerated: { min: 40, max: 85 } },
    growth: { level: 2, label: 'Mittel', perYearCm: { min: 15, max: 25 } },
    difficulty: 3,
    difficultyNote: 'Reagiert auf trockene Heizungsluft mit braunen Spitzen und auf Staunässe mit Wurzelfäule.',
    toxicity: { cats: false, dogs: false, humans: false, note: 'Laut ASPCA ungiftig für Katzen und Hunde.' },
    soil: {
      description: 'Palmenerde, sehr gut drainiert',
      mix: [
        { name: 'Palmenerde', share: 0.5 },
        { name: 'Lava / Bims', share: 0.3 },
        { name: 'Pinienrinde', share: 0.2 },
      ],
      ph: { min: 6.0, max: 6.8 },
    },
    fertilizing: { interval: 'alle 2 Wochen', note: 'März bis September, Palmendünger mit Magnesium.' },
    repotting: {
      interval: 'alle 2–3 Jahre',
      years: { min: 2, max: 3 },
      note: 'Wurzelballen möglichst intakt lassen – Palmen regenerieren beschädigte Wurzeln nur langsam.',
    },
    schedule: { fertilize: [3, 4, 5, 6, 7, 8, 9], repot: [4, 5] },
  },
  dimensions: { maxIndoorHeightCm: { min: 180, max: 250 }, maxSpreadCm: 120, specimenHeight: 1.25 },
  pot: { height: 0.3, radius: 0.19, color: '#a9a497' },
  roots: {
    structure: 'clumping-fibrous',
    structureLabel: 'Horstiges Faserwurzelwerk',
    structureNote:
      'Jeder Stamm bildet eigene sprossbürtige Wurzeln an der Basis. Palmen haben keine Pfahlwurzel; zahlreiche gleich dicke Wurzeln verzweigen sich fein.',
    depthCm: 28,
    spreadCm: 17,
    density: 4,
    waterloggingSensitivity: 5,
    recommendedPotDepthCm: { min: 30, max: 40 },
    model: { primaryCount: 44, thickness: 0.0034, branching: 0.8, tubers: false, color: '#d9c7a4' },
  },
  anatomy: [
    {
      region: 'leaf',
      title: 'Fiederwedel',
      text: 'Bis zu 60 Fiederpaare pro Wedel. Die Blättchen stehen V-förmig am Mittelnerv und leiten so Regen zur Basis.',
      anchor: [0.36, 0.95, 0.12],
    },
    {
      region: 'stem',
      title: 'Stamm',
      text: 'Die gelblichen Stämme tragen Ringe – Narben abgefallener Blattscheiden. Palmen verdicken nicht sekundär: Ein Stamm wird nicht dicker, nur höher.',
      anchor: [0.04, 0.35, 0.04],
    },
    {
      region: 'crown',
      title: 'Vegetationspunkt',
      text: 'Jeder Stamm hat nur einen einzigen Wachstumspunkt an der Spitze. Wird er beschädigt, stirbt der Stamm ab – der Horst treibt aber neue.',
      anchor: [-0.02, 0.62, 0.02],
    },
    {
      region: 'soil',
      title: 'Substrat',
      text: 'Grober Anteil aus Lava und Rinde hält das Substrat luftig. Palmwurzeln brauchen Sauerstoff mindestens so dringend wie Wasser.',
      anchor: [0.12, -0.02, 0.1],
    },
    {
      region: 'roots',
      title: 'Faserwurzeln',
      text: 'Zahlreiche Wurzeln entspringen direkt der Stammbasis und durchziehen den Topf gleichmäßig. Staunässe führt schnell zu Fäulnis.',
      anchor: [0.08, -0.2, 0.1],
    },
  ],
  model: {
    kind: 'procedural',
    generator: 'palm',
    seed: 21,
    params: {
      type: 'palm',
      stems: 7,
      stemHeight: [0.3, 0.7],
      stemRadius: 0.013,
      frondsPerStem: [2, 4],
      frondLength: [0.55, 0.8],
      leafletsPerSide: 36,
      leafletLength: 0.25,
      leafletWidth: 0.0075,
      arch: 1,
      stemColor: '#b8a954',
      leafColor: '#5f8f34',
      rachisColor: '#c7b457',
      rings: true,
    },
  },
}

const parlorPalm: Plant = {
  id: 'bergpalme',
  commonName: 'Bergpalme',
  englishName: 'Parlor Palm',
  botanicalName: 'Chamaedorea elegans',
  swatch: '#2c5b3f',
  family: 'Palmengewächse (Arecaceae)',
  origin: 'Regenwald-Unterholz in Mexiko und Guatemala',
  summary:
    'Zierliche Unterholzpalme mit schlanken grünen Stämmen und aufrechten, dunkelgrünen Wedeln. Kommt mit weniger Licht aus als fast jede andere Palme.',
  care: {
    light: { min: 0.18, max: 0.68, ideal: 0.44 },
    lightNote: 'Halbschatten bis hell, keine direkte Sonne. Gut für Nordfenster geeignet.',
    water: { min: 0.4, max: 0.65, ideal: 0.52 },
    waterNote: 'Leicht feucht halten, im Winter sparsamer. Oberfläche darf kurz antrocknen.',
    temperature: { ideal: { min: 18, max: 25 }, minimum: 12, maximum: 30 },
    humidity: { ideal: { min: 50, max: 60 }, tolerated: { min: 35, max: 80 } },
    growth: { level: 1, label: 'Langsam', perYearCm: { min: 5, max: 15 } },
    difficulty: 2,
    difficultyNote: 'Pflegeleicht. In trockener Luft anfällig für Spinnmilben – Blattunterseiten prüfen.',
    toxicity: { cats: false, dogs: false, humans: false, note: 'Laut ASPCA ungiftig für Katzen und Hunde.' },
    soil: {
      description: 'Palmenerde mit Sand oder Perlite',
      mix: [
        { name: 'Palmenerde', share: 0.6 },
        { name: 'Perlite', share: 0.25 },
        { name: 'Quarzsand', share: 0.15 },
      ],
      ph: { min: 5.8, max: 6.8 },
    },
    fertilizing: { interval: 'alle 4 Wochen', note: 'April bis September, schwach dosiert.' },
    repotting: {
      interval: 'alle 2–3 Jahre',
      years: { min: 2, max: 3 },
      note: 'Steht gern etwas beengt. Erst umtopfen, wenn Wurzeln aus dem Abzugsloch wachsen.',
    },
    schedule: { fertilize: [4, 5, 6, 7, 8, 9], repot: [4] },
  },
  dimensions: { maxIndoorHeightCm: { min: 90, max: 150 }, maxSpreadCm: 60, specimenHeight: 0.78 },
  pot: { height: 0.22, radius: 0.14, color: '#8f978b' },
  roots: {
    structure: 'fibrous',
    structureLabel: 'Feines Faserwurzelwerk',
    structureNote:
      'Dünne, dunkle Wurzeln bilden einen kompakten Ballen. Sie sind empfindlich gegen Verletzung und reagieren auf Staunässe mit Blattverfärbung.',
    depthCm: 18,
    spreadCm: 12,
    density: 3,
    waterloggingSensitivity: 4,
    recommendedPotDepthCm: { min: 20, max: 25 },
    model: { primaryCount: 30, thickness: 0.0026, branching: 0.9, tubers: false, color: '#c9b08a' },
  },
  anatomy: [
    {
      region: 'leaf',
      title: 'Fiederwedel',
      text: 'Pro Wedel 10–20 Fiederpaare mit breiten, lanzettlichen Blättchen – großflächig, um im Unterholz wenig Licht zu nutzen.',
      anchor: [0.22, 0.45, 0.1],
    },
    {
      region: 'stem',
      title: 'Stämmchen',
      text: 'Bleistiftdünne, grüne Stämme. In Kultur wachsen meist mehrere Sämlinge zusammen in einem Topf.',
      anchor: [0.02, 0.18, 0.03],
    },
    {
      region: 'crown',
      title: 'Blattscheiden',
      text: 'Neue Wedel schieben sich aus der Scheide des vorigen Blattes. Vertrocknete Scheiden können vorsichtig abgezogen werden.',
      anchor: [0.0, 0.34, 0.02],
    },
    {
      region: 'soil',
      title: 'Substrat',
      text: 'Humos, aber durchlässig. Ein Sandanteil verhindert, dass das feine Wurzelwerk verdichtet.',
      anchor: [0.09, -0.02, 0.07],
    },
    {
      region: 'roots',
      title: 'Faserwurzeln',
      text: 'Ein kompakter, eher flacher Ballen. Beim Umtopfen den Ballen nicht aufreißen – verletzte Wurzeln regenerieren nur langsam.',
      anchor: [0.06, -0.12, 0.08],
    },
  ],
  model: {
    kind: 'procedural',
    generator: 'palm',
    seed: 4,
    params: {
      type: 'palm',
      stems: 6,
      stemHeight: [0.12, 0.3],
      stemRadius: 0.0055,
      frondsPerStem: [2, 4],
      frondLength: [0.38, 0.52],
      leafletsPerSide: 15,
      leafletLength: 0.15,
      leafletWidth: 0.0105,
      arch: 0.55,
      stemColor: '#5d7a3a',
      leafColor: '#46783a',
      rachisColor: '#557a34',
      rings: false,
    },
  },
}

export const plants: Plant[] = [spiderPlant, arecaPalm, parlorPalm]

export function getPlant(id: string): Plant {
  return plants.find((p) => p.id === id) ?? plants[0]
}
