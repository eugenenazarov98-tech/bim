export interface DictionaryRow { value: string; desc: string }
export interface Dictionary { title: string; rows: DictionaryRow[] }

export const dictionaries: Dictionary[] = [
  {
    "title": "Справочник «Типы помещений и зон» (Приложение Б) — параметры MGE_ZoneType / MGE_SpaceType",
    "rows": [
      {
        "value": "Вспомогательная",
        "desc": ""
      },
      {
        "value": "Встроенно-пристроенные помещения",
        "desc": ""
      },
      {
        "value": "Арендная",
        "desc": ""
      },
      {
        "value": "Места общего пользования",
        "desc": ""
      },
      {
        "value": "Общественная",
        "desc": ""
      },
      {
        "value": "Пожарная зона",
        "desc": ""
      },
      {
        "value": "Коммерческая",
        "desc": ""
      }
    ]
  },
  {
    "title": "Типы открывания дверей (Приложение Д) — параметр MGE_OperationType",
    "rows": [
      {
        "value": "SINGLE_SWING_LEFT",
        "desc": "Дверь однопольная распашная правая"
      },
      {
        "value": "SINGLE_SWING_RIGHT",
        "desc": "Дверь однопольная распашная левая"
      },
      {
        "value": "DOUBLE_DOOR_SINGLE_SWING",
        "desc": "Дверь распашная с двумя полотнами"
      },
      {
        "value": "DOUBLE_SWING_LEFT",
        "desc": "Дверь с одним качающимся полотном правая"
      },
      {
        "value": "DOUBLE_SWING_RIGHT",
        "desc": "Дверь с одним качающимся полотном левая"
      },
      {
        "value": "DOUBLE_DOOR_DOUBLE_SWING",
        "desc": "Дверь с двумя качающимися полотнами"
      },
      {
        "value": "DOUBLE_DOOR_SINGLE_SWING_OPPOSITE_LEFT",
        "desc": "Дверь с двумя противоположно открывающимися полотнами левая"
      },
      {
        "value": "DOUBLE_DOOR_SINGLE_SWING_OPPOSITE_RIGHT",
        "desc": "Дверь с двумя противоположно открывающимися полотнами правая"
      },
      {
        "value": "SLIDING_TO_LEFT",
        "desc": "Дверь однопольная откатная левая"
      },
      {
        "value": "SLIDING_TO_RIGHT",
        "desc": "Дверь однопольная откатная правая (в документе опечатка: второй раз указано SLIDING_TO_LEFT)"
      },
      {
        "value": "DOUBLE_DOOR_SLIDING",
        "desc": "Дверь двупольная откатная"
      },
      {
        "value": "FOLDING_TO_LEFT",
        "desc": "Дверь с одним складным полотном левая"
      },
      {
        "value": "FOLDING_TO_RIGHT",
        "desc": "Дверь с одним складным полотном правая"
      },
      {
        "value": "DOUBLE_DOOR_FOLDING",
        "desc": "Дверь с двумя складными полотнами"
      },
      {
        "value": "REVOLVING",
        "desc": "Дверь карусельная (роторная, револьверная)"
      },
      {
        "value": "ROLLING",
        "desc": "Двери (ворота) подъемно-поворотные (рулонные, с щитовым полотном, секционные и т.д.)"
      },
      {
        "value": "SWING_FIXED_LEFT",
        "desc": "Распашная дверь правая с фиксированным вторым полотном"
      },
      {
        "value": "SWING_FIXED_RIGHT",
        "desc": "Распашная дверь левая с фиксированным вторым полотном"
      },
      {
        "value": "USERDEFINED",
        "desc": "Тип открывания задается пользователем"
      },
      {
        "value": "NOTDEFINED",
        "desc": "Дверь с неопределенным типом открывания"
      }
    ]
  },
  {
    "title": "Типы створок окон (Приложение Е) — параметр MGE_PartitioningType",
    "rows": [
      {
        "value": "SinglePanel",
        "desc": "Окно с одной створкой"
      },
      {
        "value": "DoublePanelVertical",
        "desc": "Окно двустворчатое. Створки расположены вертикально"
      },
      {
        "value": "DoublePanelHorizontal",
        "desc": "Окно двустворчатое. Створки расположены горизонтально"
      },
      {
        "value": "TriplePanelVertical",
        "desc": "Окно трехстворчатое. Створки расположены вертикально"
      },
      {
        "value": "TriplePanelHorizontal",
        "desc": "Окно трехстворчатое. Створки расположены горизонтально"
      },
      {
        "value": "TriplePanelBottom",
        "desc": "Окно трехстворчатое. Две вертикальные створки, одна горизонтально снизу"
      },
      {
        "value": "TriplePanelTop",
        "desc": "Окно трехстворчатое. Две вертикальные створки, одна горизонтально сверху"
      },
      {
        "value": "TriplePanelLeft",
        "desc": "Окно трехстворчатое. Две горизонтальные створки, одна вертикально слева"
      },
      {
        "value": "TriplePanelRight",
        "desc": "Окно трехстворчатое. Две горизонтальные створки, одна вертикально справа"
      },
      {
        "value": "UserDefined",
        "desc": "Пользовательский тип"
      },
      {
        "value": "NotDefined",
        "desc": "Тип расположения створок окна не указан"
      }
    ]
  },
  {
    "title": "Типы перекрытий (таблица 9) — параметр MGE_SlabType",
    "rows": [
      {
        "value": "FLOOR",
        "desc": "Межэтажное перекрытие"
      },
      {
        "value": "ROOF",
        "desc": "Перекрытие кровли"
      },
      {
        "value": "LANDING",
        "desc": "Перекрытие лестничной клетки / пандуса"
      },
      {
        "value": "BASESLAB",
        "desc": "Фундаментное перекрытие, плита"
      },
      {
        "value": "USERDEFINED",
        "desc": "Пользовательское значение"
      },
      {
        "value": "NOTDEFINED",
        "desc": "Не определено"
      }
    ]
  },
  {
    "title": "Типы покрытий (таблица 10) — параметр MGE_CoveringType",
    "rows": [
      {
        "value": "CEILING",
        "desc": "Покрытие потолка"
      },
      {
        "value": "FLOORING",
        "desc": "Покрытие пола"
      },
      {
        "value": "CLADDING",
        "desc": "Облицовка"
      },
      {
        "value": "ROOFING",
        "desc": "Покрытие кровли"
      },
      {
        "value": "MOLDING",
        "desc": "Лепнина, молдинг"
      },
      {
        "value": "SKIRTINGBOARD",
        "desc": "Плинтус"
      },
      {
        "value": "INSULATION",
        "desc": "Термо- или звукоизоляция"
      },
      {
        "value": "MEMBRANE",
        "desc": "Воздушная или гидроизоляционная мембрана"
      },
      {
        "value": "SLEEVING",
        "desc": "Оплетка, обмотка элемента"
      },
      {
        "value": "WRAPPING",
        "desc": "Упаковка, обертывание"
      },
      {
        "value": "USERDEFINED",
        "desc": "Пользовательское значение"
      },
      {
        "value": "NOTDEFINED",
        "desc": "Не определено"
      }
    ]
  },
  {
    "title": "Прочие списки значений",
    "rows": [
      {
        "value": "MGE_WallType",
        "desc": "рядовая / простенок / парапет"
      },
      {
        "value": "MGE_ProductType (стены)",
        "desc": "Панель стеновая / Блок стеновой"
      },
      {
        "value": "MGE_ConstructionType (окна)",
        "desc": "Алюминий / Высококачественная сталь / Сталь / Дерево / Дерево-алюминий / Пластик / пользовательское / не определено"
      },
      {
        "value": "MGE_WindowType",
        "desc": "WINDOW (стандартное) / SKYLIGHT (мансардное) / LIGHTDOME (смотровое)"
      },
      {
        "value": "MGE_StairFlightType / MGE_RampFlightType",
        "desc": "ПРЯМОЙ / ВИНТОВОЙ (с забежными ступенями) / СПИРАЛЬНЫЙ / КРИВОЛИНЕЙНЫЙ / пользовательский / не определено"
      },
      {
        "value": "MGE_Layout (лестницы)",
        "desc": "ВНЕШНЯЯ / ВНУТРЕННЯЯ ОТКРЫТАЯ / ВНУТРЕННЯЯ ЗАКРЫТАЯ / НАРУЖНАЯ / ВНУТРИКВАРТИРНАЯ"
      },
      {
        "value": "MGE_AssemblyPlace (сборки)",
        "desc": "SITE (на площадке) / FACTORY (заводская) / NOTDEFINED"
      },
      {
        "value": "MGE_FlatType",
        "desc": "стандарт / евро / студия / многоуровневая / пользовательское значение"
      },
      {
        "value": "MGE_SmokeNuisance",
        "desc": "Е (естественное) / П (принудительное)"
      },
      {
        "value": "FillGas",
        "desc": "воздух / аргон / криптон"
      },
      {
        "value": "MGE_Type_PP (лестничные клетки)",
        "desc": "Л1 / Л2 / Н1 / Н2 / Н3 (123-ФЗ ст. 40)"
      }
    ]
  }
];
