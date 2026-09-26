export interface IfcClassRow { category: string; ifcClass: string }

export const ifcClasses: IfcClassRow[] = [
  {
    "category": "Здание, корпус",
    "ifcClass": "IfcBuilding"
  },
  {
    "category": "Уровень, этаж",
    "ifcClass": "IfcBuildingStorey"
  },
  {
    "category": "Помещения, зоны, пространства",
    "ifcClass": "IfcSpace"
  },
  {
    "category": "Наружные стены, внутренние стены и перегородки",
    "ifcClass": "IfcWall"
  },
  {
    "category": "Перекрытие этажа",
    "ifcClass": "IfcSlab, тип FLOOR"
  },
  {
    "category": "Перекрытие кровли",
    "ifcClass": "IfcSlab, тип ROOF"
  },
  {
    "category": "Перекрытие лестничных клеток",
    "ifcClass": "IfcSlab, тип LANDING"
  },
  {
    "category": "Фундаментная плита",
    "ifcClass": "IfcSlab, тип BASESLAB"
  },
  {
    "category": "Потолок",
    "ifcClass": "IfcCovering, тип CEILING"
  },
  {
    "category": "Покрытие пола",
    "ifcClass": "IfcCovering, тип FLOORING"
  },
  {
    "category": "Облицовка",
    "ifcClass": "IfcCovering, тип CLADDING"
  },
  {
    "category": "Покрытие крыши",
    "ifcClass": "IfcCovering, тип ROOFING"
  },
  {
    "category": "Лепнина, молдинг",
    "ifcClass": "IfcCovering, тип MOLDING"
  },
  {
    "category": "Плинтус",
    "ifcClass": "IfcCovering, тип SKIRTINGBOARD"
  },
  {
    "category": "Термо- или звукоизоляция",
    "ifcClass": "IfcCovering, тип INSULATION"
  },
  {
    "category": "Воздушная или гидроизоляционная мембрана",
    "ifcClass": "IfcCovering, тип MEMBRANE"
  },
  {
    "category": "Навесные фасады, панели, витражи",
    "ifcClass": "IfcCurtainWall"
  },
  {
    "category": "Вертикальные конструктивные элементы (колонны, базы, капители, пилоны и пр.)",
    "ifcClass": "IfcColumn"
  },
  {
    "category": "Горизонтальные элементы, работающие на изгиб (балки, ригели, перемычки и пр.)",
    "ifcClass": "IfcBeam"
  },
  {
    "category": "Связи, раскосы",
    "ifcClass": "IfcMember"
  },
  {
    "category": "Пластины, косынки",
    "ifcClass": "IfcPlate"
  },
  {
    "category": "Сборки, сборные конструкции (лестницы, фермы, каркасы)",
    "ifcClass": "IfcElementAssembly"
  },
  {
    "category": "Двери",
    "ifcClass": "IfcDoor"
  },
  {
    "category": "Окна",
    "ifcClass": "IfcWindow"
  },
  {
    "category": "Проемы",
    "ifcClass": "IfcOpeningElement"
  },
  {
    "category": "Лестницы",
    "ifcClass": "IfcStair"
  },
  {
    "category": "Лестничные марши",
    "ifcClass": "IfcStairFlight"
  },
  {
    "category": "Перила, ограждения",
    "ifcClass": "IfcRailing"
  },
  {
    "category": "Рампы, пандусы",
    "ifcClass": "IfcRamp"
  },
  {
    "category": "Марши рамп, пандусов",
    "ifcClass": "IfcRampFlight"
  },
  {
    "category": "Крыши",
    "ifcClass": "IfcRoof"
  },
  {
    "category": "Затеняющие устройства (козырьки, ставни, жалюзи и др.)",
    "ifcClass": "IfcShadingDevice"
  },
  {
    "category": "Вертикальный транспорт, транспортное оборудование",
    "ifcClass": "IfcTransportElement"
  },
  {
    "category": "Мебель",
    "ifcClass": "IfcFurnishing"
  },
  {
    "category": "Воронка водосточная, дождеприемная",
    "ifcClass": "IfcFlowTerminal"
  },
  {
    "category": "Вентиляционные колпаки, зонты, решетки",
    "ifcClass": "IfcAirTerminal"
  }
];
