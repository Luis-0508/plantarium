import type { Plant } from './types'

/*
 * UNVERIFIED DATA: care, size and root values are typical indoor
 * recommendations compiled from general horticultural references and have not
 * been reviewed. Each plant carries `dataQuality: 'placeholder'` until checked;
 * the UI shows a note for such entries. Do not treat them as authoritative.
 */

const spiderPlant: Plant = {
  id: 'gruenlilie',
  commonName: { en: 'Spider Plant', de: 'Grünlilie' },
  botanicalName: 'Chlorophytum comosum',
  swatch: '#7f9c3c',
  dataQuality: 'placeholder',
  family: { en: 'Asparagus family (Asparagaceae)', de: 'Spargelgewächse (Asparagaceae)' },
  origin: { en: 'Tropical and southern Africa', de: 'Tropisches und südliches Afrika' },
  summary: {
    en: 'Forms dense rosettes of narrow, arching leaves and sends out long runners carrying plantlets. Fleshy storage roots make it forgiving when watering is forgotten.',
    de: 'Bildet dichte Rosetten schmaler, überhängender Blätter und schiebt lange Ausläufer mit Kindeln. Fleischige Speicherwurzeln machen sie verzeihend bei vergessenem Gießen.',
  },
  care: {
    light: { min: 0.3, max: 0.8, ideal: 0.62 },
    lightNote: {
      en: 'Bright without harsh midday sun. In partial shade the variegation fades.',
      de: 'Hell ohne pralle Mittagssonne. Im Halbschatten verblasst die Panaschierung.',
    },
    water: { min: 0.3, max: 0.6, ideal: 0.45 },
    waterNote: {
      en: 'Let the top 2–3 cm dry out. The storage roots bridge dry spells.',
      de: 'Obere 2–3 cm antrocknen lassen. Die Speicherwurzeln überbrücken Trockenphasen.',
    },
    temperature: { ideal: { min: 18, max: 24 }, minimum: 10, maximum: 30 },
    humidity: { ideal: { min: 40, max: 60 }, tolerated: { min: 30, max: 80 } },
    growth: { level: 3, perYearCm: { min: 20, max: 40 } },
    difficulty: 1,
    difficultyNote: {
      en: 'Very robust. Brown leaf tips usually point to dry air or fluoridated water.',
      de: 'Sehr robust. Braune Blattspitzen zeigen meist trockene Luft oder fluoridhaltiges Wasser.',
    },
    toxicity: {
      cats: false,
      dogs: false,
      humans: false,
      note: {
        en: 'Non-toxic according to the ASPCA. Cats like to nibble on it – in larger amounts this can upset the stomach.',
        de: 'Laut ASPCA ungiftig. Katzen knabbern gern daran – in größeren Mengen kann das den Magen reizen.',
      },
    },
    soil: {
      description: { en: 'Loose potting soil with a mineral share', de: 'Lockere Blumenerde mit mineralischem Anteil' },
      mix: [
        { name: { en: 'Potting soil', de: 'Blumenerde' }, share: 0.6 },
        { name: { en: 'Perlite', de: 'Perlite' }, share: 0.25 },
        { name: { en: 'Coir', de: 'Kokosfaser' }, share: 0.15 },
      ],
      ph: { min: 6.0, max: 7.2 },
    },
    fertilizing: {
      interval: { en: 'every 2–3 weeks', de: 'alle 2–3 Wochen' },
      note: {
        en: 'April to September, half-strength foliage plant fertiliser.',
        de: 'Von April bis September, halbe Dosis Grünpflanzendünger.',
      },
    },
    repotting: {
      interval: { en: 'annually', de: 'jährlich' },
      years: { min: 1, max: 2 },
      note: {
        en: 'The thick roots can burst thin-walled pots. Repot once roots appear at the surface.',
        de: 'Die dicken Wurzeln können dünnwandige Töpfe sprengen. Bei Wurzeln an der Oberfläche umtopfen.',
      },
    },
    schedule: { fertilize: [4, 5, 6, 7, 8, 9], repot: [3, 4] },
  },
  dimensions: { maxIndoorHeightCm: { min: 30, max: 45 }, maxSpreadCm: 60, specimenHeight: 0.34 },
  pot: { height: 0.16, radius: 0.095, color: '#b9b2a4' },
  roots: {
    structure: 'tuberous',
    structureLabel: { en: 'Fleshy storage roots', de: 'Fleischige Speicherwurzeln' },
    structureNote: {
      en: 'White roots up to pencil thickness with spindle-shaped swellings that store water and nutrients. They quickly fill the whole pot.',
      de: 'Weiße, bis bleistiftdicke Wurzeln mit spindelförmigen Verdickungen, die Wasser und Nährstoffe speichern. Sie füllen den Topf rasch vollständig aus.',
    },
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
      title: { en: 'Leaf', de: 'Blatt' },
      text: {
        en: 'Linear, channelled leaves up to 45 cm. The cream-white central stripe contains hardly any chlorophyll – which is why the variegated form needs more light.',
        de: 'Linealische, rinnige Blätter bis 45 cm. Der cremeweiße Mittelstreifen enthält kaum Chlorophyll – deshalb braucht die panaschierte Form mehr Licht.',
      },
      anchor: [0.2, 0.2, 0.06],
    },
    {
      region: 'stem',
      title: { en: 'Runners', de: 'Ausläufer' },
      text: {
        en: 'No true stem: the spider plant sends out long flower stalks, at whose ends plantlets with their own aerial roots form.',
        de: 'Kein echter Stamm: Die Grünlilie treibt lange Blütenstiele, an deren Enden Kindel mit eigenen Luftwurzeln entstehen.',
      },
      anchor: [-0.3, 0.1, 0.12],
    },
    {
      region: 'crown',
      title: { en: 'Rhizome & heart', de: 'Rhizom & Herz' },
      text: {
        en: 'All leaves grow from the short rhizome. The heart should not sit deeper in the soil than before, or it may rot.',
        de: 'Aus dem kurzen Rhizom wachsen alle Blätter. Das Herz sollte nicht tiefer als zuvor in der Erde sitzen, sonst droht Fäulnis.',
      },
      anchor: [0, 0.03, 0.02],
    },
    {
      region: 'soil',
      title: { en: 'Substrate', de: 'Substrat' },
      text: {
        en: 'Free-draining and structurally stable. Perlite keeps the fleshy roots from sitting in moisture permanently.',
        de: 'Durchlässig und strukturstabil. Perlite verhindert, dass die fleischigen Wurzeln dauerhaft im Nassen stehen.',
      },
      anchor: [0.08, -0.02, 0.06],
    },
    {
      region: 'roots',
      title: { en: 'Storage roots', de: 'Speicherwurzeln' },
      text: {
        en: 'The tuberous, thickened roots store water for weeks. They are why the plant copes well with gaps in watering.',
        de: 'Die knollig verdickten Wurzeln speichern Wasser für Wochen. Sie sind der Grund, warum die Pflanze Gießpausen gut verträgt.',
      },
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
  commonName: { en: 'Areca Palm', de: 'Goldfruchtpalme' },
  botanicalName: 'Dypsis lutescens',
  swatch: '#b08a22',
  dataQuality: 'placeholder',
  family: { en: 'Palm family (Arecaceae)', de: 'Palmengewächse (Arecaceae)' },
  origin: { en: 'Eastern Madagascar', de: 'Ostmadagaskar' },
  summary: {
    en: 'Multi-stemmed palm with golden-yellow, ringed canes and softly arching pinnate fronds. Grows in clumps, which gives it a bushy look.',
    de: 'Mehrstämmige Palme mit goldgelben, geringelten Stämmen und weich überhängenden Fiederwedeln. Wächst in Horsten und wirkt dadurch buschig.',
  },
  care: {
    light: { min: 0.5, max: 0.9, ideal: 0.74 },
    lightNote: {
      en: 'Very bright, ideally with morning or evening sun. Too dark and it turns sparse and pale.',
      de: 'Sehr hell, gern mit Morgen- oder Abendsonne. Zu dunkel wird sie licht und blass.',
    },
    water: { min: 0.5, max: 0.75, ideal: 0.62 },
    waterNote: {
      en: 'Keep evenly moist, never wet. Use soft, room-temperature water.',
      de: 'Gleichmäßig feucht halten, nie nass. Kalkarmes, zimmerwarmes Wasser verwenden.',
    },
    temperature: { ideal: { min: 18, max: 27 }, minimum: 15, maximum: 32 },
    humidity: { ideal: { min: 50, max: 70 }, tolerated: { min: 40, max: 85 } },
    growth: { level: 2, perYearCm: { min: 15, max: 25 } },
    difficulty: 3,
    difficultyNote: {
      en: 'Reacts to dry heated air with brown tips and to waterlogging with root rot.',
      de: 'Reagiert auf trockene Heizungsluft mit braunen Spitzen und auf Staunässe mit Wurzelfäule.',
    },
    toxicity: {
      cats: false,
      dogs: false,
      humans: false,
      note: { en: 'Non-toxic to cats and dogs according to the ASPCA.', de: 'Laut ASPCA ungiftig für Katzen und Hunde.' },
    },
    soil: {
      description: { en: 'Palm soil, very well drained', de: 'Palmenerde, sehr gut drainiert' },
      mix: [
        { name: { en: 'Palm soil', de: 'Palmenerde' }, share: 0.5 },
        { name: { en: 'Lava / pumice', de: 'Lava / Bims' }, share: 0.3 },
        { name: { en: 'Pine bark', de: 'Pinienrinde' }, share: 0.2 },
      ],
      ph: { min: 6.0, max: 6.8 },
    },
    fertilizing: {
      interval: { en: 'every 2 weeks', de: 'alle 2 Wochen' },
      note: {
        en: 'March to September, palm fertiliser with magnesium.',
        de: 'März bis September, Palmendünger mit Magnesium.',
      },
    },
    repotting: {
      interval: { en: 'every 2–3 years', de: 'alle 2–3 Jahre' },
      years: { min: 2, max: 3 },
      note: {
        en: 'Keep the root ball as intact as possible – palms regenerate damaged roots only slowly.',
        de: 'Wurzelballen möglichst intakt lassen – Palmen regenerieren beschädigte Wurzeln nur langsam.',
      },
    },
    schedule: { fertilize: [3, 4, 5, 6, 7, 8, 9], repot: [4, 5] },
  },
  dimensions: { maxIndoorHeightCm: { min: 180, max: 250 }, maxSpreadCm: 120, specimenHeight: 1.25 },
  pot: { height: 0.34, radius: 0.19, color: '#a9a497' },
  roots: {
    structure: 'clumping-fibrous',
    structureLabel: { en: 'Clumping fibrous roots', de: 'Horstiges Faserwurzelwerk' },
    structureNote: {
      en: 'Each cane forms its own adventitious roots at the base. Palms have no taproot; numerous roots of equal thickness branch finely.',
      de: 'Jeder Stamm bildet eigene sprossbürtige Wurzeln an der Basis. Palmen haben keine Pfahlwurzel; zahlreiche gleich dicke Wurzeln verzweigen sich fein.',
    },
    depthCm: 28,
    spreadCm: 17,
    density: 4,
    waterloggingSensitivity: 5,
    recommendedPotDepthCm: { min: 30, max: 40 },
    model: { primaryCount: 64, thickness: 0.0021, branching: 0.95, tubers: false, color: '#d9c7a4' },
  },
  anatomy: [
    {
      region: 'leaf',
      title: { en: 'Pinnate frond', de: 'Fiederwedel' },
      text: {
        en: 'Up to 60 pairs of leaflets per frond. The leaflets sit in a V along the midrib and so channel rain to the base.',
        de: 'Bis zu 60 Fiederpaare pro Wedel. Die Blättchen stehen V-förmig am Mittelnerv und leiten so Regen zur Basis.',
      },
      anchor: [0.36, 0.95, 0.12],
    },
    {
      region: 'stem',
      title: { en: 'Trunk', de: 'Stamm' },
      text: {
        en: 'The yellowish canes carry rings – scars of shed leaf sheaths. Palms have no secondary thickening: a cane does not grow thicker, only taller.',
        de: 'Die gelblichen Stämme tragen Ringe – Narben abgefallener Blattscheiden. Palmen verdicken nicht sekundär: Ein Stamm wird nicht dicker, nur höher.',
      },
      anchor: [0.04, 0.35, 0.04],
    },
    {
      region: 'crown',
      title: { en: 'Growing point', de: 'Vegetationspunkt' },
      text: {
        en: 'Each cane has just a single growing point at its tip. If it is damaged, the cane dies – but the clump sends up new ones.',
        de: 'Jeder Stamm hat nur einen einzigen Wachstumspunkt an der Spitze. Wird er beschädigt, stirbt der Stamm ab – der Horst treibt aber neue.',
      },
      anchor: [-0.02, 0.62, 0.02],
    },
    {
      region: 'soil',
      title: { en: 'Substrate', de: 'Substrat' },
      text: {
        en: 'A coarse share of lava and bark keeps the substrate airy. Palm roots need oxygen at least as urgently as water.',
        de: 'Grober Anteil aus Lava und Rinde hält das Substrat luftig. Palmwurzeln brauchen Sauerstoff mindestens so dringend wie Wasser.',
      },
      anchor: [0.12, -0.02, 0.1],
    },
    {
      region: 'roots',
      title: { en: 'Fibrous roots', de: 'Faserwurzeln' },
      text: {
        en: 'Numerous roots arise directly from the cane base and run evenly through the pot. Waterlogging quickly leads to rot.',
        de: 'Zahlreiche Wurzeln entspringen direkt der Stammbasis und durchziehen den Topf gleichmäßig. Staunässe führt schnell zu Fäulnis.',
      },
      anchor: [0.08, -0.2, 0.1],
    },
  ],
  model: {
    kind: 'procedural',
    generator: 'palm',
    seed: 21,
    params: {
      type: 'palm',
      stems: 8,
      stemHeight: [0.32, 0.8],
      stemRadius: 0.0105,
      frondsPerStem: [2, 4],
      frondLength: [0.55, 0.85],
      leafletsPerSide: 40,
      leafletLength: 0.24,
      leafletWidth: 0.0068,
      arch: 1,
      leafletDroop: 1.05,
      frondSpacing: 0.06,
      suckers: 2,
      irregularity: 0.7,
      rachisTwist: 0.8,
      ageYellowing: 0.3,
      stemColor: '#b3a24c',
      stemTopColor: '#9fae4f',
      leafColor: '#5f8f34',
      rachisColor: '#c9b552',
      rings: true,
    },
  },
}

const parlorPalm: Plant = {
  id: 'bergpalme',
  commonName: { en: 'Parlor Palm', de: 'Bergpalme' },
  botanicalName: 'Chamaedorea elegans',
  swatch: '#2c5b3f',
  dataQuality: 'placeholder',
  family: { en: 'Palm family (Arecaceae)', de: 'Palmengewächse (Arecaceae)' },
  origin: { en: 'Rainforest understorey in Mexico and Guatemala', de: 'Regenwald-Unterholz in Mexiko und Guatemala' },
  summary: {
    en: 'Dainty understorey palm with slender green canes and upright, dark green fronds. Manages with less light than almost any other palm.',
    de: 'Zierliche Unterholzpalme mit schlanken grünen Stämmen und aufrechten, dunkelgrünen Wedeln. Kommt mit weniger Licht aus als fast jede andere Palme.',
  },
  care: {
    light: { min: 0.18, max: 0.68, ideal: 0.44 },
    lightNote: {
      en: 'Partial shade to bright, no direct sun. Well suited to north-facing windows.',
      de: 'Halbschatten bis hell, keine direkte Sonne. Gut für Nordfenster geeignet.',
    },
    water: { min: 0.4, max: 0.65, ideal: 0.52 },
    waterNote: {
      en: 'Keep lightly moist, more sparingly in winter. The surface may dry briefly.',
      de: 'Leicht feucht halten, im Winter sparsamer. Oberfläche darf kurz antrocknen.',
    },
    temperature: { ideal: { min: 18, max: 25 }, minimum: 12, maximum: 30 },
    humidity: { ideal: { min: 50, max: 60 }, tolerated: { min: 35, max: 80 } },
    growth: { level: 1, perYearCm: { min: 5, max: 15 } },
    difficulty: 2,
    difficultyNote: {
      en: 'Easy care. Prone to spider mites in dry air – check the leaf undersides.',
      de: 'Pflegeleicht. In trockener Luft anfällig für Spinnmilben – Blattunterseiten prüfen.',
    },
    toxicity: {
      cats: false,
      dogs: false,
      humans: false,
      note: { en: 'Non-toxic to cats and dogs according to the ASPCA.', de: 'Laut ASPCA ungiftig für Katzen und Hunde.' },
    },
    soil: {
      description: { en: 'Palm soil with sand or perlite', de: 'Palmenerde mit Sand oder Perlite' },
      mix: [
        { name: { en: 'Palm soil', de: 'Palmenerde' }, share: 0.6 },
        { name: { en: 'Perlite', de: 'Perlite' }, share: 0.25 },
        { name: { en: 'Quartz sand', de: 'Quarzsand' }, share: 0.15 },
      ],
      ph: { min: 5.8, max: 6.8 },
    },
    fertilizing: {
      interval: { en: 'every 4 weeks', de: 'alle 4 Wochen' },
      note: { en: 'April to September, at low strength.', de: 'April bis September, schwach dosiert.' },
    },
    repotting: {
      interval: { en: 'every 2–3 years', de: 'alle 2–3 Jahre' },
      years: { min: 2, max: 3 },
      note: {
        en: 'Likes to be slightly pot-bound. Only repot once roots grow out of the drainage hole.',
        de: 'Steht gern etwas beengt. Erst umtopfen, wenn Wurzeln aus dem Abzugsloch wachsen.',
      },
    },
    schedule: { fertilize: [4, 5, 6, 7, 8, 9], repot: [4] },
  },
  dimensions: { maxIndoorHeightCm: { min: 90, max: 150 }, maxSpreadCm: 60, specimenHeight: 0.78 },
  pot: { height: 0.22, radius: 0.14, color: '#8f978b' },
  roots: {
    structure: 'fibrous',
    structureLabel: { en: 'Fine fibrous roots', de: 'Feines Faserwurzelwerk' },
    structureNote: {
      en: 'Thin, dark roots form a compact ball. They are easily injured and react to waterlogging with leaf discolouration.',
      de: 'Dünne, dunkle Wurzeln bilden einen kompakten Ballen. Sie sind empfindlich gegen Verletzung und reagieren auf Staunässe mit Blattverfärbung.',
    },
    depthCm: 18,
    spreadCm: 12,
    density: 3,
    waterloggingSensitivity: 4,
    recommendedPotDepthCm: { min: 20, max: 25 },
    model: { primaryCount: 46, thickness: 0.0015, branching: 0.85, tubers: false, color: '#c9b08a' },
  },
  anatomy: [
    {
      region: 'leaf',
      title: { en: 'Pinnate frond', de: 'Fiederwedel' },
      text: {
        en: '10–20 pairs of broad, lanceolate leaflets per frond – large in area to make use of scarce understorey light.',
        de: 'Pro Wedel 10–20 Fiederpaare mit breiten, lanzettlichen Blättchen – großflächig, um im Unterholz wenig Licht zu nutzen.',
      },
      anchor: [0.22, 0.45, 0.1],
    },
    {
      region: 'stem',
      title: { en: 'Canes', de: 'Stämmchen' },
      text: {
        en: 'Pencil-thin, green canes. In cultivation several seedlings usually grow together in one pot.',
        de: 'Bleistiftdünne, grüne Stämme. In Kultur wachsen meist mehrere Sämlinge zusammen in einem Topf.',
      },
      anchor: [0.02, 0.18, 0.03],
    },
    {
      region: 'crown',
      title: { en: 'Leaf sheaths', de: 'Blattscheiden' },
      text: {
        en: 'New fronds push out of the sheath of the previous leaf. Dried sheaths can be peeled off carefully.',
        de: 'Neue Wedel schieben sich aus der Scheide des vorigen Blattes. Vertrocknete Scheiden können vorsichtig abgezogen werden.',
      },
      anchor: [0.0, 0.34, 0.02],
    },
    {
      region: 'soil',
      title: { en: 'Substrate', de: 'Substrat' },
      text: {
        en: 'Humus-rich but free-draining. A share of sand keeps the fine roots from compacting.',
        de: 'Humos, aber durchlässig. Ein Sandanteil verhindert, dass das feine Wurzelwerk verdichtet.',
      },
      anchor: [0.09, -0.02, 0.07],
    },
    {
      region: 'roots',
      title: { en: 'Fibrous roots', de: 'Faserwurzeln' },
      text: {
        en: 'A compact, rather shallow root ball. Do not tear the ball apart when repotting – injured roots regenerate only slowly.',
        de: 'Ein kompakter, eher flacher Ballen. Beim Umtopfen den Ballen nicht aufreißen – verletzte Wurzeln regenerieren nur langsam.',
      },
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
      leafletDroop: 0.62,
      frondSpacing: 0.025,
      suckers: 0,
      irregularity: 0.3,
      rachisTwist: 0.15,
      ageYellowing: 0.06,
      stemColor: '#5d7a3a',
      leafColor: '#46783a',
      rachisColor: '#557a34',
      rings: false,
    },
  },
}

const peacockPlant: Plant = {
  id: 'pfauen-korbmarante',
  commonName: { en: 'Peacock Plant', de: 'Pfauen-Korbmarante' },
  botanicalName: 'Goeppertia makoyana',
  swatch: '#7a4c78',
  dataQuality: 'placeholder',
  nyctinasty: true,
  family: { en: 'Arrowroot family (Marantaceae)', de: 'Pfeilwurzgewächse (Marantaceae)' },
  origin: { en: 'Atlantic Forest of eastern Brazil', de: 'Atlantischer Regenwald im Osten Brasiliens' },
  summary: {
    en: 'Broad, oval leaves on long, thin stalks with a feather-like pattern – silvery green above, wine red below. In the evening it raises its leaves and lowers them again in the morning.',
    de: 'Breite, ovale Blätter auf langen, dünnen Stielen mit federartiger Zeichnung – oben silbrig-grün, unten weinrot. Abends richtet sie die Blätter auf und senkt sie morgens wieder.',
  },
  care: {
    light: { min: 0.22, max: 0.6, ideal: 0.42 },
    lightNote: {
      en: 'Bright to partial shade, never direct sun – otherwise the leaves bleach and curl.',
      de: 'Hell bis halbschattig, nie direkte Sonne – die Blätter bleichen sonst aus und rollen sich ein.',
    },
    water: { min: 0.55, max: 0.8, ideal: 0.66 },
    waterNote: {
      en: 'Keep evenly moist without waterlogging. Soft, low-lime water prevents brown edges.',
      de: 'Gleichmäßig feucht halten, ohne Staunässe. Weiches, kalkarmes Wasser verhindert braune Ränder.',
    },
    temperature: { ideal: { min: 18, max: 24 }, minimum: 16, maximum: 30 },
    humidity: { ideal: { min: 60, max: 80 }, tolerated: { min: 45, max: 90 } },
    growth: { level: 2, perYearCm: { min: 10, max: 20 } },
    difficulty: 4,
    difficultyNote: {
      en: 'Demanding: it answers dry air, lime and draughts with curled, brown-edged leaves.',
      de: 'Anspruchsvoll: Trockene Luft, Kalk und Zugluft quittiert sie mit eingerollten, braun gerandeten Blättern.',
    },
    toxicity: {
      cats: false,
      dogs: false,
      humans: false,
      note: { en: 'Non-toxic to cats and dogs according to the ASPCA.', de: 'Laut ASPCA ungiftig für Katzen und Hunde.' },
    },
    soil: {
      description: {
        en: 'Humus-rich, slightly acidic soil with structure',
        de: 'Humose, leicht saure Erde mit Struktur',
      },
      mix: [
        { name: { en: 'Potting soil', de: 'Blumenerde' }, share: 0.5 },
        { name: { en: 'Coir', de: 'Kokosfaser' }, share: 0.25 },
        { name: { en: 'Perlite', de: 'Perlite' }, share: 0.25 },
      ],
      ph: { min: 5.5, max: 6.5 },
    },
    fertilizing: {
      interval: { en: 'every 2–4 weeks', de: 'alle 2–4 Wochen' },
      note: {
        en: 'April to August, half-strength foliage plant fertiliser – the roots are sensitive to salts.',
        de: 'April bis August, halbe Dosis Grünpflanzendünger – die Wurzeln sind salzempfindlich.',
      },
    },
    repotting: {
      interval: { en: 'every 1–2 years', de: 'alle 1–2 Jahre' },
      years: { min: 1, max: 2 },
      note: {
        en: 'Shallow, wide pots suit the shallow-running rhizome. The clump can be divided when repotting.',
        de: 'Flache, breite Töpfe passen zum flach streichenden Rhizom. Beim Umtopfen lässt sich der Horst teilen.',
      },
    },
    schedule: { fertilize: [4, 5, 6, 7, 8], repot: [4, 5] },
  },
  dimensions: { maxIndoorHeightCm: { min: 40, max: 60 }, maxSpreadCm: 50, specimenHeight: 0.48 },
  pot: { height: 0.17, radius: 0.12, color: '#c0b6a8' },
  roots: {
    structure: 'rhizomatous',
    structureLabel: { en: 'Rhizome with fibrous roots', de: 'Rhizom mit Faserwurzeln' },
    structureNote: {
      en: 'Short, creeping rhizomes send out fine, rather shallow-running roots. Some roots form small storage tubers.',
      de: 'Kurze, kriechende Rhizome treiben feine, eher flach streichende Wurzeln. Einzelne Wurzeln bilden kleine Speicherknöllchen.',
    },
    depthCm: 11,
    spreadCm: 11,
    density: 4,
    waterloggingSensitivity: 4,
    recommendedPotDepthCm: { min: 14, max: 18 },
    model: { primaryCount: 40, thickness: 0.0018, branching: 0.8, tubers: true, color: '#dcc7a2' },
  },
  anatomy: [
    {
      region: 'leaf',
      title: { en: 'Leaf blade', de: 'Blattspreite' },
      text: {
        en: 'Dark, oval patches along the lateral veins create the peacock pattern. The underside carries the same markings in wine red.',
        de: 'Dunkle, ovale Flecken entlang der Seitennerven ergeben das Pfauenmuster. Die Unterseite trägt dieselbe Zeichnung in Weinrot.',
      },
      anchor: [0.12, 0.3, 0.1],
    },
    {
      region: 'stem',
      title: { en: 'Petiole & joint', de: 'Blattstiel & Gelenk' },
      text: {
        en: 'A thickened joint (pulvinus) below the blade turns the leaf over the day. At night the leaves stand upright – hence “prayer plant”.',
        de: 'Ein verdicktes Gelenk (Pulvinus) unter der Spreite dreht das Blatt über den Tag. Nachts stellen sich die Blätter auf – daher „Gebetspflanze“.',
      },
      anchor: [0.06, 0.2, 0.05],
    },
    {
      region: 'crown',
      title: { en: 'Young leaves', de: 'Junge Blätter' },
      text: {
        en: 'New leaves emerge rolled up from the centre and unfurl over several days. In air that is too dry they stay stuck together.',
        de: 'Neue Blätter schieben sich zusammengerollt aus der Mitte und entfalten sich erst über einige Tage. Bei zu trockener Luft bleiben sie verklebt.',
      },
      anchor: [0.0, 0.14, 0.0],
    },
    {
      region: 'soil',
      title: { en: 'Substrate', de: 'Substrat' },
      text: {
        en: 'Humus-rich and evenly moist, but airy. Coir holds water, perlite keeps the substrate loose.',
        de: 'Humos und gleichmäßig feucht, aber luftig. Kokosfaser speichert Wasser, Perlite hält das Substrat locker.',
      },
      anchor: [0.08, -0.02, 0.06],
    },
    {
      region: 'roots',
      title: { en: 'Rhizome & roots', de: 'Rhizom & Wurzeln' },
      text: {
        en: 'The roots stay shallow. Constant wetness in the lower part of the pot quickly leads to rot – hence shallow pots with a drainage hole.',
        de: 'Das Wurzelwerk bleibt flach. Dauernässe im unteren Topfbereich führt schnell zu Fäulnis – deshalb flache Töpfe mit Abzugsloch.',
      },
      anchor: [0.05, -0.09, 0.06],
    },
  ],
  model: {
    kind: 'procedural',
    generator: 'calathea',
    seed: 13,
    params: {
      type: 'calathea',
      leafCount: 48,
      petioleLength: [0.04, 0.3],
      bladeLength: 0.19,
      bladeWidth: 0.043,
      patches: 9,
      groundColor: '#c5d487',
      patchColor: '#2f5a26',
      undersideColor: '#8a3559',
      petioleColor: '#7a4637',
    },
  },
}

const dragonTree: Plant = {
  id: 'drachenbaum',
  commonName: { en: 'Madagascar Dragon Tree', de: 'Drachenbaum' },
  botanicalName: 'Dracaena marginata',
  swatch: '#a8452f',
  dataQuality: 'placeholder',
  family: { en: 'Asparagus family (Asparagaceae)', de: 'Spargelgewächse (Asparagaceae)' },
  origin: { en: 'Madagascar and Mauritius', de: 'Madagaskar und Mauritius' },
  summary: {
    en: 'Slender, woody trunks of different heights with dense tufts of narrow, red-edged leaves. It sheds old leaves from below and so becomes a small tree over the years.',
    de: 'Schlanke, verholzte Stämme unterschiedlicher Höhe mit dichten Schöpfen schmaler, rot gerandeter Blätter. Unten verliert sie alte Blätter und wird so mit den Jahren zum kleinen Baum.',
  },
  care: {
    light: { min: 0.38, max: 0.85, ideal: 0.64 },
    lightNote: {
      en: 'Bright, ideally with some morning or evening sun. In low light the leaves narrow and the trunks grow leggy.',
      de: 'Hell, gern mit etwas Morgen- oder Abendsonne. Bei wenig Licht werden die Blätter schmal und die Stämme vergeilen.',
    },
    water: { min: 0.22, max: 0.55, ideal: 0.38 },
    waterNote: {
      en: 'Water only once the upper half of the soil is dry. Considerably less in winter.',
      de: 'Erst gießen, wenn die obere Hälfte der Erde trocken ist. Im Winter deutlich sparsamer.',
    },
    temperature: { ideal: { min: 18, max: 26 }, minimum: 12, maximum: 32 },
    humidity: { ideal: { min: 40, max: 60 }, tolerated: { min: 30, max: 80 } },
    growth: { level: 2, perYearCm: { min: 15, max: 30 } },
    difficulty: 2,
    difficultyNote: {
      en: 'Robust. Brown tips point to fluoridated water or dry air, yellow lower leaves to too much water.',
      de: 'Robust. Braune Spitzen deuten auf fluoridhaltiges Wasser oder trockene Luft, gelbe untere Blätter auf zu viel Wasser.',
    },
    toxicity: {
      cats: true,
      dogs: true,
      humans: false,
      note: {
        en: 'Toxic to cats and dogs according to the ASPCA (saponins): vomiting, drooling, dilated pupils in cats.',
        de: 'Laut ASPCA giftig für Katzen und Hunde (Saponine): Erbrechen, Speicheln, bei Katzen erweiterte Pupillen.',
      },
    },
    soil: {
      description: {
        en: 'Free-draining potting soil with a mineral share',
        de: 'Durchlässige Blumenerde mit mineralischem Anteil',
      },
      mix: [
        { name: { en: 'Potting soil', de: 'Blumenerde' }, share: 0.6 },
        { name: { en: 'Lava / pumice', de: 'Lava / Bims' }, share: 0.25 },
        { name: { en: 'Quartz sand', de: 'Quarzsand' }, share: 0.15 },
      ],
      ph: { min: 6.0, max: 6.5 },
    },
    fertilizing: {
      interval: { en: 'every 3–4 weeks', de: 'alle 3–4 Wochen' },
      note: {
        en: 'March to September, foliage plant fertiliser at normal strength.',
        de: 'März bis September, Grünpflanzendünger in normaler Dosis.',
      },
    },
    repotting: {
      interval: { en: 'every 2–3 years', de: 'alle 2–3 Jahre' },
      years: { min: 2, max: 3 },
      note: {
        en: 'Choose heavy pots – the tall trunks make the plant top-heavy.',
        de: 'Schwere Töpfe wählen – die hohen Stämme machen die Pflanze kopflastig.',
      },
    },
    schedule: { fertilize: [3, 4, 5, 6, 7, 8, 9], repot: [3, 4] },
  },
  dimensions: { maxIndoorHeightCm: { min: 150, max: 300 }, maxSpreadCm: 90, specimenHeight: 0.85 },
  pot: { height: 0.21, radius: 0.13, color: '#9a8f86' },
  roots: {
    structure: 'fibrous',
    structureLabel: { en: 'Orange-yellow fibrous roots', de: 'Orangegelbe Faserwurzeln' },
    structureNote: {
      en: 'Sturdy, strikingly orange roots arise from the trunk base and branch moderately. They tolerate drought better than wetness.',
      de: 'Kräftige, auffällig orange gefärbte Wurzeln entspringen der Stammbasis und verzweigen sich mäßig. Sie vertragen Trockenheit besser als Nässe.',
    },
    depthCm: 17,
    spreadCm: 11,
    density: 3,
    waterloggingSensitivity: 5,
    recommendedPotDepthCm: { min: 20, max: 30 },
    model: { primaryCount: 34, thickness: 0.0026, branching: 0.7, tubers: false, color: '#d8963e' },
  },
  anatomy: [
    {
      region: 'leaf',
      title: { en: 'Leaf tuft', de: 'Blattschopf' },
      text: {
        en: 'Narrow, leathery leaves with a red margin sit in a dense spiral at the shoot tip. The lowest ones yellow after two to three years and drop.',
        de: 'Schmale, ledrige Blätter mit rotem Rand stehen spiralig dicht an der Triebspitze. Die untersten vergilben nach zwei bis drei Jahren und fallen ab.',
      },
      anchor: [0.15, 0.8, 0.1],
    },
    {
      region: 'stem',
      title: { en: 'Trunk', de: 'Stamm' },
      text: {
        en: 'The rings on the bark are scars of fallen leaves. Unlike palms, the dragon tree can thicken secondarily and branch.',
        de: 'Die Ringe auf der Rinde sind Narben abgefallener Blätter. Anders als Palmen kann der Drachenbaum sekundär in die Dicke wachsen und sich verzweigen.',
      },
      anchor: [0.04, 0.3, 0.03],
    },
    {
      region: 'crown',
      title: { en: 'Shoot tip', de: 'Triebspitze' },
      text: {
        en: 'New leaves form here. If a trunk is cut back, it usually sprouts two or three new heads below the cut.',
        de: 'Hier entstehen die neuen Blätter. Wird ein Stamm gekappt, treibt er unterhalb der Schnittstelle meist zwei bis drei neue Köpfe.',
      },
      anchor: [0.0, 0.72, 0.0],
    },
    {
      region: 'soil',
      title: { en: 'Substrate', de: 'Substrat' },
      text: {
        en: 'Mineral components let excess water drain quickly and give the tall trunks support.',
        de: 'Mineralische Anteile lassen überschüssiges Wasser schnell ablaufen und geben den hohen Stämmen Halt.',
      },
      anchor: [0.1, -0.02, 0.08],
    },
    {
      region: 'roots',
      title: { en: 'Fibrous roots', de: 'Faserwurzeln' },
      text: {
        en: 'The orange colour is normal and not a sign of rot. Mushy, dark brown roots, however, are.',
        de: 'Die orange Farbe ist normal und kein Zeichen von Fäulnis. Matschige, dunkelbraune Wurzeln dagegen schon.',
      },
      anchor: [0.06, -0.13, 0.07],
    },
  ],
  model: {
    kind: 'procedural',
    generator: 'dracaena',
    seed: 9,
    params: {
      type: 'dracaena',
      canes: [0.32, 0.18],
      caneRadius: 0.014,
      branches: [2, 3],
      branchLength: 0.2,
      leavesPerHead: 52,
      headLength: 0.06,
      leafLength: 0.32,
      leafWidth: 0.0055,
      leafColor: '#7a9466',
      marginColor: '#c4616a',
      stripeColor: '#e3cfae',
      barkColor: '#8b8170',
    },
  },
}

export const plants: Plant[] = [spiderPlant, arecaPalm, parlorPalm, peacockPlant, dragonTree]

export function getPlant(id: string): Plant {
  return plants.find((p) => p.id === id) ?? plants[0]
}
