// reportService.ts
// Генерация Word-отчётов (ежедневный / еженедельный / ежемесячный)
// npm install docx@8.5.0

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  VerticalAlign,
  PageOrientation,
  AlignmentType,
} from 'docx';

export interface StudentAttendance {
  studentId: string;
  fullName: string;
  records: Record<string, string>;
  reason?: string;
}

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

const FONT = 'Times New Roman';

const MONTHS_RU = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const MONTHS_NOM = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const border = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const allBorders = { top: border, bottom: border, left: border, right: border };

function run(text: string, size = 16, bold = false): TextRun {
  return new TextRun({ text, font: FONT, size, bold, color: '000000' });
}

function centeredParagraph(text: string, size = 16, bold = false): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 0, line: 240 },
    children: [run(text, size, bold)],
  });
}

function leftParagraph(text: string, size = 16): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 0, line: 240 },
    children: [run(text, size)],
  });
}

function cellCenter(text: string, width: number, size = 14, bold = false): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: allBorders,
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [run(text, size, bold)],
      }),
    ],
  });
}

function cellLeft(text: string, width: number, size = 14): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: allBorders,
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [run(text, size)],
      }),
    ],
  });
}

function emptyCell(width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: allBorders,
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [] })],
  });
}

function makeHeaderCell(text: string, w: number, rowSpan = 1): TableCell {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: allBorders,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    rowSpan,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, font: FONT, size: 12, color: '000000' })],
      }),
    ],
  });
}

async function downloadDocx(doc: Document, filename: string): Promise<void> {
  const buffer = await Packer.toBlob(doc);
  const url = URL.createObjectURL(buffer);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── ЕЖЕДНЕВНЫЙ ОТЧЁТ ────────────────────────────────────────────────────────

export async function generateDailyReport(
  
    groupName: string,
  date: Date,
  students: StudentAttendance[],
  disciplines: { id: string; name: string }[],
): Promise<void> {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS_RU[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const COL_NUM = 431;
  const COL_NAME = 2382;
  const COL_DISC = [383, 383, 383, 384, 384, 384, 384, 389];
  const COL_RSN = 1233;

  const discNames = disciplines.slice(0, 8).map((d) => d.name);
  while (discNames.length < 8) discNames.push('');

  const headerRow1 = new TableRow({
    tableHeader: true,
    height: { value: 210, rule: 'exact' },
    children: [
      new TableCell({
        width: { size: COL_NUM, type: WidthType.DXA },
        borders: allBorders,
        margins: { top: 40, bottom: 40, left: 60, right: 60 },
        verticalAlign: VerticalAlign.CENTER,
        rowSpan: 2,
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [run('№', 16)] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [run('п/п', 16)] }),
        ],
      }),
      new TableCell({
        width: { size: COL_NAME, type: WidthType.DXA },
        borders: allBorders,
        margins: { top: 40, bottom: 40, left: 60, right: 60 },
        verticalAlign: VerticalAlign.CENTER,
        rowSpan: 2,
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [run('Ф. И.', 16)] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [run('обучающегося', 16)] }),
        ],
      }),
      new TableCell({
        width: { size: COL_DISC.reduce((a, b) => a + b, 0), type: WidthType.DXA },
        borders: allBorders,
        margins: { top: 40, bottom: 40, left: 60, right: 60 },
        verticalAlign: VerticalAlign.CENTER,
        columnSpan: 8,
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [run('Наименование дисциплин', 16)] }),
        ],
      }),
      new TableCell({
        width: { size: COL_RSN, type: WidthType.DXA },
        borders: allBorders,
        margins: { top: 40, bottom: 40, left: 60, right: 60 },
        verticalAlign: VerticalAlign.CENTER,
        rowSpan: 2,
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [run('Причина отсутствия', 14)] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [run('обучающегося на занятиях (заполняет кл. руководитель)', 14)],
          }),
        ],
      }),
    ],
  });

  const headerRow2 = new TableRow({
    tableHeader: true,
    height: { value: 615, rule: 'exact' },
    children: COL_DISC.map(
      (w, i) =>
        new TableCell({
          width: { size: w, type: WidthType.DXA },
          borders: allBorders,
          margins: { top: 40, bottom: 40, left: 20, right: 20 },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: discNames[i] || '', font: FONT, size: 12, color: '000000' })],
            }),
          ],
        }),
    ),
  });

  // Создаем строки студентов
  const studentRows = students.map((s, idx) => {
    // Для каждой дисциплины берем свою отметку из s.records
    const markCells = disciplines.slice(0, 8).map((disc, i) => {
      const discId = String(disc.id);
      const mark = s.records[discId] || '-';
      return cellCenter(mark, COL_DISC[i] || 383, 16);
    });

    while (markCells.length < 8) {
      markCells.push(emptyCell(383));
    }

    // Причина отсутствия — если есть хотя бы одна отметка Н или У
    let reason = '';
    for (const disc of disciplines) {
      const mark = s.records[String(disc.id)] || '-';
      if (mark === 'Н' || mark === 'У') {
        reason = s.reason || '';
        break;
      }
    }

    return new TableRow({
      height: { value: 210, rule: 'exact' },
      children: [
        cellCenter(String(idx + 1), COL_NUM, 18),
        cellLeft(s.fullName, COL_NAME, 18),
        ...markCells,
        cellCenter(reason, COL_RSN, 14),
      ],
    });
  });

  const signRow = new TableRow({
    height: { value: 519, rule: 'exact' },
    children: [
      cellCenter('Подпись преподавателя каждой дисциплины', COL_NUM + COL_NAME, 16, false),
      ...COL_DISC.map((w) => emptyCell(w)),
      emptyCell(COL_RSN),
    ],
  });

  const table = new Table({
    width: { size: 7120, type: WidthType.DXA },
    columnWidths: [COL_NUM, COL_NAME, ...COL_DISC, COL_RSN],
    rows: [headerRow1, headerRow2, ...studentRows, signRow],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 16838, height: 11906, orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          centeredParagraph('МИНИСТЕРСТВО ОБРАЗОВАНИЯ И НАУКИ КРАСНОДАРСКОГО КРАЯ', 16, true),
          centeredParagraph(
            'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ПРОФЕССИОНАЛЬНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ КРАСНОДАРСКОГО КРАЯ «УСТЬ-ЛАБИНСКИЙ СОЦИАЛЬНО-ПЕДАГОГИЧЕСКИЙ КОЛЛЕДЖ»',
            16,
          ),
          new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
          centeredParagraph('ЕЖЕДНЕВНЫЙ ОТЧЕТ', 16, true),
          centeredParagraph(
            `о работе классного руководителя по контролю посещаемости учебных занятий обучающимися группы ${groupName}`,
            16,
            true,
          ),
          centeredParagraph(`за «${day}»  ${month} 20${year}г.`, 16, true),
          new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
          new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
          table,
          new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
          new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
          leftParagraph('Классный руководитель      ______________ Граков Д. В.', 14),
          leftParagraph('Староста группы         ______________ Гойкина И.В.', 14),
        ],
      },
    ],
  });

  await downloadDocx(doc, `Ежедневный_отчет_${groupName}_${dateStr}.docx`);
}

// ─── ЕЖЕНЕДЕЛЬНЫЙ ОТЧЁТ ──────────────────────────────────────────────────────

export async function generateWeeklyReport(
  groupName: string,
  weekStart: Date,
  weekEnd: Date,
  students: StudentAttendance[],
): Promise<void> {
  const isoStart = weekStart.toISOString().split('T')[0];
  const isoEnd = weekEnd.toISOString().split('T')[0];

  const counted = students.map((s) => {
    let total = 0,
      respectful = 0,
      disrespectful = 0;
    for (const [date, mark] of Object.entries(s.records)) {
      if (date >= isoStart && date <= isoEnd) {
        if (mark === 'Н') {
          total++;
          disrespectful++;
        }
        if (mark === 'У') {
          total++;
          respectful++;
        }
      }
    }
    return { ...s, total, respectful, disrespectful };
  });

  const W = {
    num: 400,
    name: 2200,
    total: 480,
    resp: 700,
    nresp: 700,
    talk: 900,
    phone: 600,
    face: 600,
    letter: 900,
    council: 700,
    psych: 1000,
    head: 800,
    headMark: 1000,
    direction: 1000,
  };
  const allWidths = Object.values(W);

  const headerRow1 = new TableRow({
    tableHeader: true,
    children: [
      makeHeaderCell('№\nп/п', W.num, 2),
      makeHeaderCell('Ф. И.\nобучающегося', W.name, 2),
      makeHeaderCell('Число', W.total + W.resp + W.nresp, 1),
      new TableCell({
        width: { size: W.talk + W.phone + W.face + W.letter, type: WidthType.DXA },
        borders: allBorders,
        columnSpan: 4,
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run('Работа с родителями', 12)] })],
      }),
      new TableCell({
        width: { size: W.council + W.psych + W.head, type: WidthType.DXA },
        borders: allBorders,
        columnSpan: 3,
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [run('Направлено ходатайство для проведения профилактической работы', 12)],
          }),
        ],
      }),
      makeHeaderCell(
        'Отметка заведующей отделением о направлении студента на Совет профилактики',
        W.headMark + W.direction,
        1,
      ),
    ],
  });

  const headerRow2 = new TableRow({
    tableHeader: true,
    children: [
      makeHeaderCell('Всего', W.total),
      makeHeaderCell('Уважи-тельные', W.resp),
      makeHeaderCell('Неуважи-тельные', W.nresp),
      makeHeaderCell('Беседа со студентом', W.talk),
      makeHeaderCell('телеф. звонок', W.phone),
      makeHeaderCell('личная беседа', W.face),
      makeHeaderCell('письменное уведомление', W.letter),
      makeHeaderCell('в студенческий Совет', W.council),
      makeHeaderCell('в социально-психологическую службу', W.psych),
      makeHeaderCell('заведующей отделением', W.head),
      makeHeaderCell('заведующей отделением', W.headMark),
      makeHeaderCell('направлении студента на Совет профилактики', W.direction),
    ],
  });

  const studentRows = counted.map((s, idx) =>
    new TableRow({
      children: [
        cellCenter(String(idx + 1), W.num, 16),
        cellLeft(s.fullName, W.name, 16),
        cellCenter(s.total > 0 ? String(s.total) : '', W.total, 16),
        cellCenter(s.respectful > 0 ? String(s.respectful) : '', W.resp, 16),
        cellCenter(s.disrespectful > 0 ? String(s.disrespectful) : '', W.nresp, 16),
        emptyCell(W.talk),
        emptyCell(W.phone),
        emptyCell(W.face),
        emptyCell(W.letter),
        emptyCell(W.council),
        emptyCell(W.psych),
        emptyCell(W.head),
        emptyCell(W.headMark),
        emptyCell(W.direction),
      ],
    }),
  );

  const totalAll = counted.reduce((a, s) => a + s.total, 0);
  const totalR = counted.reduce((a, s) => a + s.respectful, 0);
  const totalNR = counted.reduce((a, s) => a + s.disrespectful, 0);

  const totalRow = new TableRow({
    children: [
      cellCenter('Итого', W.num + W.name, 16, true),
      cellCenter(totalAll > 0 ? String(totalAll) : '', W.total, 16),
      cellCenter(totalR > 0 ? String(totalR) : '', W.resp, 16),
      cellCenter(totalNR > 0 ? String(totalNR) : '', W.nresp, 16),
      emptyCell(W.talk),
      emptyCell(W.phone),
      emptyCell(W.face),
      emptyCell(W.letter),
      emptyCell(W.council),
      emptyCell(W.psych),
      emptyCell(W.head),
      emptyCell(W.headMark),
      emptyCell(W.direction),
    ],
  });

  const table = new Table({
    width: { size: allWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: allWidths,
    rows: [headerRow1, headerRow2, ...studentRows, totalRow],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 16838, height: 11906, orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, right: 500, bottom: 720, left: 720 },
          },
        },
        children: [
          centeredParagraph('МИНИСТЕРСТВО ОБРАЗОВАНИЯ И НАУКИ КРАСНОДАРСКОГО КРАЯ', 16, true),
          centeredParagraph(
            'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ПРОФЕССИОНАЛЬНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ КРАСНОДАРСКОГО КРАЯ «УСТЬ-ЛАБИНСКИЙ СОЦИАЛЬНО-ПЕДАГОГИЧЕСКИЙ КОЛЛЕДЖ»',
            16,
          ),
          new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
          centeredParagraph('ЕЖЕНЕДЕЛЬНЫЙ ОТЧЕТ', 20, true),
          centeredParagraph(
            `о работе классного руководителя по контролю посещаемости учебных занятий обучающимися группы ${groupName}`,
            16,
            true,
          ),
          new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
          table,
          new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
          new Paragraph({
            spacing: { after: 0, line: 240 },
            children: [
              run(
                `«${String(weekStart.getDate()).padStart(2, '0')}» ${MONTHS_RU[weekStart.getMonth()]} ${weekStart.getFullYear()} г.`,
                16,
              ),
            ],
          }),
          new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
          leftParagraph('Классный руководитель ___________________ Граков Д. В.', 16),
          leftParagraph('Староста группы      ___________________ Гойкина И. В.', 16),
        ],
      },
    ],
  });

  await downloadDocx(doc, `Еженедельный_отчет_${groupName}_${isoStart}_${isoEnd}.docx`);
}

// ─── ЕЖЕМЕСЯЧНЫЙ ОТЧЁТ ───────────────────────────────────────────────────────

export async function generateMonthlyReport(
  groupName: string,
  month: Date,
  students: StudentAttendance[],
): Promise<void> {
  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const dates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(`${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  const COL_NUM = 350;
  const COL_NAME = 1800;
  const COL_DAY = Math.max(200, Math.floor(8000 / daysInMonth));
  const COL_TOTAL = 400;
  const COL_RESP = 550;
  const COL_NRESP = 550;
  const COL_TALK = 700;
  const COL_PHONE = 500;
  const COL_FACE = 500;
  const COL_LETTER = 700;

  const dayWidths = Array(daysInMonth).fill(COL_DAY);
  const allWidths = [
    COL_NUM,
    COL_NAME,
    ...dayWidths,
    COL_TOTAL,
    COL_RESP,
    COL_NRESP,
    COL_TALK,
    COL_PHONE,
    COL_FACE,
    COL_LETTER,
  ];

  function mkHeader(text: string, w: number, rowSpan = 1, colSpan = 1) {
    return new TableCell({
      width: { size: w, type: WidthType.DXA },
      borders: allBorders,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 30, bottom: 30, left: 30, right: 30 },
      rowSpan,
      columnSpan: colSpan,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text, font: FONT, size: 11, color: '000000' })],
        }),
      ],
    });
  }

  const header1 = new TableRow({
    tableHeader: true,
    children: [
      mkHeader('№\nп/п', COL_NUM, 2),
      mkHeader('ФИО\nобучающегося', COL_NAME, 2),
      mkHeader('Число', dayWidths.reduce((a, b) => a + b, 0), 1, daysInMonth),
      mkHeader('Всего', COL_TOTAL, 2),
      mkHeader('Уважит.', COL_RESP, 2),
      mkHeader('Неуважит.', COL_NRESP, 2),
      new TableCell({
        width: { size: COL_TALK + COL_PHONE + COL_FACE + COL_LETTER, type: WidthType.DXA },
        borders: allBorders,
        columnSpan: 4,
        margins: { top: 30, bottom: 30, left: 30, right: 30 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Работа с родителями', font: FONT, size: 11, color: '000000' })],
          }),
        ],
      }),
    ],
  });

  const header2 = new TableRow({
    tableHeader: true,
    children: [
      ...dates.map(
        (_, i) =>
          new TableCell({
            width: { size: COL_DAY, type: WidthType.DXA },
            borders: allBorders,
            margins: { top: 20, bottom: 20, left: 10, right: 10 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: String(i + 1), font: FONT, size: 10, color: '000000' })],
              }),
            ],
          }),
      ),
      mkHeader('Беседа со студентом', COL_TALK),
      mkHeader('телеф. звонок', COL_PHONE),
      mkHeader('лична я беседа', COL_FACE),
      mkHeader('письменное уведомление', COL_LETTER),
    ],
  });

  const studentRows = students.map((s, idx) => {
    let total = 0,
      resp = 0,
      nresp = 0;

    const dayCells = dates.map((dateStr) => {
      const mark = s.records[dateStr] || '';
      if (mark === 'Н') {
        total++;
        nresp++;
      }
      if (mark === 'У') {
        total++;
        resp++;
      }
      const display = mark === '-' ? '' : mark;
      return new TableCell({
        width: { size: COL_DAY, type: WidthType.DXA },
        borders: allBorders,
        margins: { top: 20, bottom: 20, left: 10, right: 10 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: display, font: FONT, size: 12, color: '000000' })],
          }),
        ],
      });
    });

    return new TableRow({
      children: [
        cellCenter(String(idx + 1), COL_NUM, 14),
        cellLeft(s.fullName, COL_NAME, 14),
        ...dayCells,
        cellCenter(total > 0 ? String(total) : '', COL_TOTAL, 14),
        cellCenter(resp > 0 ? String(resp) : '', COL_RESP, 14),
        cellCenter(nresp > 0 ? String(nresp) : '', COL_NRESP, 14),
        emptyCell(COL_TALK),
        emptyCell(COL_PHONE),
        emptyCell(COL_FACE),
        emptyCell(COL_LETTER),
      ],
    });
  });

  const table = new Table({
    width: { size: allWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: allWidths,
    rows: [header1, header2, ...studentRows],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 16838, height: 11906, orientation: PageOrientation.LANDSCAPE },
            margin: { top: 500, right: 400, bottom: 500, left: 600 },
          },
        },
        children: [
          centeredParagraph('МИНИСТЕРСТВО ОБРАЗОВАНИЯ И НАУКИ КРАСНОДАРСКОГО КРАЯ', 16, true),
          centeredParagraph(
            'ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ПРОФЕССИОНАЛЬНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ КРАСНОДАРСКОГО КРАЯ «УСТЬ-ЛАБИНСКИЙ СОЦИАЛЬНО-ПЕДАГОГИЧЕСКИЙ КОЛЛЕДЖ»',
            16,
          ),
          new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
          centeredParagraph('ЕЖЕМЕСЯЧНЫЙ ОТЧЕТ', 20, true),
          centeredParagraph(
            `о работе классного руководителя по контролю посещаемости учебных занятий обучающимися группы ${groupName}`,
            16,
            true,
          ),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 0, line: 240 },
            children: [run(`за  ${MONTHS_NOM[monthIdx]}  ${year}  г.`, 16, true)],
          }),
          new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
          table,
          new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
          new Paragraph({
            spacing: { after: 0, line: 240 },
            children: [run(`«______» _____________ ${year} г.`, 16)],
          }),
          new Paragraph({ spacing: { after: 0, line: 240 }, children: [] }),
          leftParagraph('Классный руководитель ___________________ Граков Д. В.', 16),
          leftParagraph('Староста группы      ___________________ Гойкина И. В.', 16),
        ],
      },
    ],
  });

  await downloadDocx(doc, `Ежемесячный_отчет_${groupName}_${MONTHS_NOM[monthIdx]}_${year}.docx`);
}