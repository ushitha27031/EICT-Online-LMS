/* Devi Balika Vidyalaya, Colombo 08 — Grade 12 Second Term Test, April 2021. ICT Paper I, English medium.
   40 MCQs typed from a scanned paper. There is no marking scheme: the answers were worked out by EICT,
   and the ones marked chk are worth a second look. Format: see pp-si-2022.js (src/sch name the school paper). */
(function(){
const P=window.EICT_PP=window.EICT_PP||{si:[],en:[]};P.en=P.en||[];
const K='devi21', S='Devi Balika · G12 Term 2 · 2021', Y=2021;
const q=(n,u,t,text,opts,ans,why,x)=>P.en.push(Object.assign({id:'en-'+K+'-'+String(n).padStart(2,'0'),y:Y,n,u,t,src:S,sch:K,text,opts,ans,why},x||{}));
const IMG=f=>'pp/en/'+f+'.png';
const F={fixed:true};

q(1,2,'Computer history','Consider the following statements.\nA. Ada Augusta Lovelace was the first computer programmer.\nB. John Presper Eckert was the inventor of UNIVAC computer.\nC. Mark I was the first automatic computer invented by Howard Aiken.\nSelect the correct statement/statements.',
  ['A only','A and B only','A and C only','B and C only','All A, B and C'],5,
  'Ada Lovelace wrote the first algorithm for Babbage’s Analytical Engine. UNIVAC was built by Eckert (with Mauchly). The Harvard Mark I, designed by Howard Aiken, was the first automatic general-purpose computer.',{fixed:true,chk:true});
q(2,2,'Computer history','Which of the following inventions laid the foundation to the modern computer technology?',
  ['Transistor','Microchip','Abacus','Electronic Valve','Integrated Circuit'],1,
  'The transistor replaced the vacuum tube and made computers small, reliable and cheap; ICs and microchips are built from transistors.',{chk:true});
q(3,2,'Ports','A parallel port is most often used to connect a',
  ['Monitor','Mouse','Printer','Pen drive','External Hard Drive'],3,
  'The parallel (LPT) port was mainly used for printers.');
q(4,1,'Data processing','Which of the following is not a processing?',
  ['Arranging','Manipulating','Calculating','Gathering','Comparing'],4,
  'Gathering (collecting) data happens before processing. Arranging, manipulating, calculating and comparing are processing activities.');
q(5,2,'Input devices','The technology which recognizes the printed and typed texts is',
  ['OMR','OCR','MICR','Barcode Reader','None of the above'],2,
  'Optical Character Recognition (OCR) reads printed or typed characters. OMR reads marks, MICR reads magnetic ink on cheques.',F);
q(6,3,'Character encoding','The original ASCII code used …….. bits of each byte, reserving that last bit for error checking.',
  ['4','5','6','7','8'],4,
  'Standard ASCII is a 7-bit code; the eighth bit was used as a parity bit.',F);
q(7,3,'Character encoding','Which type of computers uses the 8-bit code called EBCDIC?',
  ['Desktop computers','Mini computers','Mainframe computers','Super computers','None of the above'],3,
  'EBCDIC was developed by IBM for its mainframe computers.',F);
q(8,3,'Number systems','Convert the binary number 1001.0010 to decimal.',
  ['125','12.5','90.125','9.125','9.12'],4,
  '1001₂ = 9 and .0010₂ = 1/8 = 0.125, so 9.125.');
q(9,3,'Number representation','8-bit 1’s complement and 2’s complement of decimal 111 is …………',
  ['1101111 and 10010000','10010000 and 10010001','10010001 and 10010000','10010000 and 01101111','10010001 and 01101111'],2,
  '111 = 01101111₂. Inverting every bit gives the 1’s complement 10010000; adding 1 gives the 2’s complement 10010001 (these represent −111).',F);
q(10,3,'Number representation','The range of signed decimal numbers that can be represented by a 6-bit 1’s complement number is',
  ['−31 to +31','−63 to +63','−64 to +63','−32 to 31','0 to +31'],1,
  'With n bits, 1’s complement covers −(2ⁿ⁻¹−1) to +(2ⁿ⁻¹−1). For 6 bits: −31 to +31.',F);
q(11,4,'Boolean algebra','The Boolean expression A.B + A.B + A.B is equivalent to',
  ['A + B','A’.B','(A + B)’','A.B','A.B’'],4,
  'By the idempotent law X + X = X, so A.B + A.B + A.B = A.B.',F);
q(12,2,'Software','Which of the following is not a type of software?',
  ['System Software','Application Software','Utility Software','Entertainment Software','None of these'],4,
  'Software is classified as system software (including utilities) and application software. Games are application software, not a separate type.',{fixed:true,chk:true});
q(13,4,'Karnaugh maps','Consider the following K-map. Which is the correct logic expression when you simplify it using the given values?',
  ['A’ + AB’ + C’D’','A’ + B’ + A’D’C’','A’ + B’ + C’D’','B’C + B’C’ + A’C + C’D’','C’D’ + A’B’ + A’B + AB’'],3,
  'Rows AB = 00 and 01 are all 1s → A’. Rows 00 and 10 are all 1s → B’. The column CD = 00 is all 1s → C’D’. So F = A’ + B’ + C’D’.',
  {code:'        CD=00  CD=01  CD=11  CD=10\nAB=00     1      1      1      1\nAB=01     1      1      1      1\nAB=11     1      0      0      0\nAB=10     1      1      1      1'});
q(14,4,'Logic circuits','Which of the following circuits represents Q = A + B, using NAND gates only?',
  ['Circuit (1)','Circuit (2)','Circuit (3)','Circuit (4)','Circuit (5)'],3,
  'A + B = (A’·B’)’. Two NAND gates with tied inputs make A’ and B’, and a third NAND gives (A’·B’)’ = A + B — circuit (3).',{img:IMG('devi21-14'),fixed:true});
q(15,4,'Logic gates','Which of the following digital logic gates can be built using a single transistor?',
  ['AND gates','NOT gates','NAND gates','OR gates','XOR gates'],2,
  'A single transistor working as a switch inverts its input, so it makes a NOT gate. The others need two or more transistors.');
q(16,4,'Boolean algebra','One of De Morgan’s theorems states that logically there is no difference between',
  ['NOR and AND gate with inverted inputs','NAND and AND gate with inverted inputs','NOR and OR gate with inverted inputs','AND and NAND gate with inverted inputs','NAND and NOR gate with inverted inputs'],1,
  '(A + B)’ = A’·B’: a NOR gate is the same as an AND gate with inverted inputs.');
q(17,2,'CPU','Consider the following statements regarding the registers.\nA. High speed memory locations built into the ALU\nB. Registers are faster than cache memory\nC. Use to store data and instructions temporarily\nWhat is/are the correct statement/statements?',
  ['A only','A and B only','A and C only','B and C only','All A, B and C'],4,
  'Registers are inside the CPU (not only the ALU), are faster than cache, and hold data and instructions temporarily while they are processed.',{fixed:true,chk:true});
q(18,3,'Number systems','Which of the following is the binary representation of 4⅝?',
  ['100.011','010.011','110.101','100.101','101.101'],4,
  '4 = 100₂ and 5/8 = 0.625 = .101₂, so 100.101₂.');
q(19,3,'Number representation','The number of bits used to store a BCD digit is',
  ['2','4','8','6','3'],2,
  'Binary Coded Decimal stores each decimal digit 0–9 in 4 bits.');
q(20,2,'Memory','Which one of the following is a criterion with regard to the comparison of different types of memories?',
  ['Security','Integrity','Density','Accuracy','Efficiency'],3,
  'Memories are compared by speed, capacity/density, cost per bit, volatility and access method. Density (how much is stored per unit) is one of them.',{chk:true});
q(21,1,'Data processing','Consider the following steps of the Data Processing Life Cycle.\nA – Data validation\nB – Data collection\nC – Data processing\nD – Data storing and output\nThe correct sequence of the above is',
  ['A, B, C and D','B, A, C and D','B, D, C and A','B, C, D and A','C, B, A and D'],2,
  'Data is first collected, then validated, then processed, and finally stored and output: B, A, C, D.',F);
q(22,2,'CPU','The ALU of a computer responds to the commands coming from',
  ['Primary memory','Control Unit','Secondary memory','Cache memory','Memory Registers'],2,
  'The Control Unit decodes instructions and tells the ALU which operation to carry out.');
q(23,2,'Software','Which one of the following is not an example of a utility software?',
  ['Virus Scanner','Web browser','Disk Defragmenter','Scan Disk','Device Driver'],2,
  'A web browser is application software. Virus scanners, defragmenters and disk checkers are utilities.',{chk:true});
q(24,2,'Memory hierarchy','The last on the hierarchy of the following memory devices is ______.',
  ['Main memory','Magnetic memory','Registers','Optical storage','L1 Cache memory'],4,
  'From fastest to slowest: registers → L1 cache → main memory → magnetic disk → optical storage. Optical storage is at the bottom.',{chk:true});
q(25,2,'Memory','Consider the following memory types.\nA. Read Only Memory\nB. Secondary Storage\nC. Register Memory\nD. Flash Memory\nE. Random Access Memory\nWhich of the above can be classified as volatile memory?',
  ['A and E only','A and C only','C and E only','A, B and D only','A, C and E only'],3,
  'Registers and RAM lose their contents when power is off. ROM, flash and secondary storage keep their data.',F);
q(26,8,'ER diagrams','Consider the following statements about the Entity Relationship diagram.\nA. Name is a composite attribute.\nB. Employee is a weak entity.\nC. Age is a derived attribute.\nD. Phone is a multi-valued attribute.\nE. Supervision is a unary relationship.\nWhich of the above statements is correct?',
  ['B and C','A, C and E','A, B, C and D','A, C, D and E','A, B, C, D and E'],4,
  'Name splits into Fname and Lname (composite). Age is drawn dashed (derived), Phone with a double ellipse (multi-valued), and Supervision links Employee to itself (unary). Employee has the key NID, so it is not weak.',{img:IMG('devi21-26'),fixed:true});
q(27,8,'Relational model','Consider the following statements about tables in a database.\nA. Each table has a unique name in a database.\nB. The number of records in a table is called its cardinality and the number of columns in a table is called the degree.\nC. The number of records in a table can be zero.\nWhich of the above statements is correct?',
  ['A and B only','A and C only','C only','B and C only','A, B and C'],5,
  'All three are true: table names are unique, cardinality = rows and degree = columns, and an empty table has zero records.',F);
q(28,8,'Relationships','Which of the following represents a many-to-many relationship?',
  ['Diagram (1) Country – Capital','Diagram (2) Class – Student','Diagram (3) Employee – Department','Diagram (4) Book – Student','Diagram (5) Department – Employee'],4,
  'In (4) every book links to several students and every student to several books — many-to-many. (1) is one-to-one; the others are one-to-many / many-to-one.',{img:IMG('devi21-28'),fixed:true});
q(29,1,'Data & information','Which of the following is not structured data?',
  ['Telephone Number','Credit Card Number','Email','Address','Date of birth'],4,
  'Telephone numbers, card numbers, emails and dates follow a fixed format. A postal address is free text with no fixed structure.',{chk:true});
q(30,8,'Integrity','Which of the following statements about integrity constraints in a database is incorrect?',
  ['Integrity constraints can be used to check whether the relational database data is accurate and consistent.','When creating a table, domain integrity checks the inclusion of the data type, the size of the column, and whether it accepts empty values.','Referential integrity is maintained by having the primary key in one table as the foreign key in another table.','Attribute integrity is maintained by using different names for each column in the table.','The primary key must remain identical and maintain entity integrity by not being empty.'],4,
  'Giving columns different names has nothing to do with integrity. Domain, entity and referential integrity are described correctly in the other options.',F);
q(31,8,'Normalization','Consider the table below. In what normal form does the table exist?',
  ['Zero normal form','First normal form','Second normal form','Third normal form','None of the above'],2,
  'Every value is atomic, so it is in 1NF. The key is (Teacher_id, Subject) but Teacher_age depends only on Teacher_id — a partial dependency, so it is not in 2NF.',
  {code:'Teacher_id | Subject     | Teacher_age\n111        | Mathematics | 38\n111        | Physics     | 38\n222        | Biology     | 38\n333        | Physics     | 40\n333        | Chemistry   | 40',fixed:true});
q(32,8,'Keys','Consider the same table (Teacher_id, Subject, Teacher_age). Which of the following statements about it is true?\nA. This table contains a composite primary key.\nB. Teacher_age column depends entirely on the primary key in the table.\nC. Subject is a candidate key.',
  ['A only','A and C','B only','B and C','A, B and C'],1,
  'Neither Teacher_id nor Subject is unique alone, so the key is the composite (Teacher_id, Subject). Teacher_age depends only on part of it, and Subject repeats so it is not a candidate key.',
  {code:'Teacher_id | Subject     | Teacher_age\n111        | Mathematics | 38\n111        | Physics     | 38\n222        | Biology     | 38\n333        | Physics     | 40\n333        | Chemistry   | 40',fixed:true});
q(33,5,'Multitasking','Which of the following operating systems is not a multitasking operating system?',
  ['Linux','Ubuntu','Windows','DOS','Mac OS'],4,
  'MS-DOS is a single-tasking operating system; the others run many programs at once.');
q(34,5,'OS functions','Consider the following statements regarding operating systems.\nA. Operating systems manage computer software and hardware and act as an interface for users to access those resources.\nB. An operating system is required to run all programs, including computer system firmware.\nC. An operating system is responsible for managing the components of a computer system.\nWhich of the above statements is correct?',
  ['A and B','A and C','C only','B and C','A, B and C'],2,
  'Firmware (such as the BIOS) runs before the OS is loaded, so B is false. A and C describe the OS correctly.',F);
q(35,5,'Process states','Process termination is not possible due to which of the following?',
  ['When the processing is finished.','When the required resources are not available.','At the end of the time allocation.','Awaiting for an input/output event occurrence.','Depending on the needs of the operating system.'],4,
  'A process waiting for I/O moves to the blocked (waiting) state — it is not terminated.',{chk:true});
q(36,5,'Process management','Which of the following is not included in the Process Control Block (PCB)?',
  ['State','Pointer','Register','Data','Program Counter'],4,
  'The PCB holds the process state, pointers, register values and program counter. The process’s data itself is in memory, not in the PCB.');
q(37,5,'Process management','Which of the following statements regarding the long-term scheduler is true?\nA. It selects which process has to be executed next and allocates CPU.\nB. It selects which process has to be brought into the ready queue.\nC. It selects which process to remove from memory by swapping.',
  ['A only','A and C','B only','B and C','A, B and C'],3,
  'The long-term scheduler admits jobs into the ready queue. Choosing the next process for the CPU is the short-term scheduler; swapping out is the medium-term scheduler.',F);
q(38,5,'File systems','Which of the following functions is included in the file management of the operating system?\nA. File creation and deletion\nB. Spooling\nC. Directory creation\nD. Mapping files in secondary storage',
  ['A, B and C','A, C and D','B, C and D','A, B and D','A, B, C and D'],2,
  'Creating/deleting files, creating directories and mapping files onto secondary storage are file management. Spooling belongs to device (I/O) management.',F);
q(39,5,'Memory management','Which of the following is not a memory-management function of the operating system?',
  ['Keeping track of the main memory.','Determining the capacity to be assigned to each process in a multi-programming environment.','Allocating memory based on the need of the process.','Keeping relevant operational information in the Process Control Block (PCB).','Recovering allocated memory after the end of a process.'],4,
  'Keeping information in the PCB is process management. The other four are memory management. (The original question was worded with a double negative.)',{edited:true,chk:true});
q(40,5,'Virtual memory','The logical address is the address of the memory space assigned to a virtual memory page. A physical address refers to a memory space in the main memory. Which of the following converts a logical address to a physical address?',
  ['Control unit','Central processing unit','Memory management unit','Arithmetic and Logic unit','Main memory unit'],3,
  'The Memory Management Unit (MMU) translates logical (virtual) addresses into physical addresses.');
})();
