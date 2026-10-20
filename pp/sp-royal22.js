/* Royal College, Colombo 07 — Grade 13 Third Term Test, November 2022. ICT Paper I, English medium.
   44 of its 50 MCQs, typed from a scanned paper: Q12 (wrong addresses), Q16 (no valid MAC address),
   Q22 and Q23 (two answers each), Q43 (option cut off) and Q49 (unclear) are left out.
   The pencil marks on the scan are not trusted: the answers were worked out by EICT, and the ones
   marked chk are worth a second look. Format: see pp-si-2022.js (src/sch name the school paper). */
(function(){
const P=window.EICT_PP=window.EICT_PP||{si:[],en:[]};P.en=P.en||[];
const K='royal22', S='Royal College · G13 Term 3 · 2022', Y=2022;
const q=(n,u,t,text,opts,ans,why,x)=>P.en.push(Object.assign({id:'en-'+K+'-'+String(n).padStart(2,'0'),y:Y,n,u,t,src:S,sch:K,text,opts,ans,why},x||{}));
const IMG=f=>'pp/en/'+f+'.png';
const F={fixed:true};
const FLOW='Questions 34–36 use the flowchart shown, and these three programs:\nA:  list1 = input("Enter list a : ")\n    a = [int(x) for x in list1.split()]\n    list2 = input("Enter list b : ")\n    b = [int(x) for x in list2.split()]\n    total = 0\n    for j1 in a:\n        for j2 in b:\n            if j1 == j2:\n                total = total + 1\n    print(total)\nB:  the same as A, but written a[i] = [...] and b[i] = [...]\nC:  the same as A, but with for r in a: / for s in b: / if r == s: total += 1';

q(1,3,'Number systems','Converting (0111011.100)₂ to base 16 gives which of the following?',
  ['73.8','3C.4','3B.8','73.4','3B.4'],3,
  'Group in fours from the point: 0011 1011 . 1000 = 3 B . 8, so 3B.8₁₆.');
q(2,3,'Number representation','Which decimal number is equivalent to the two’s complement binary number 10111?',
  ['−23','−9','−7','+22','+7'],2,
  'The leading 1 means negative. Invert and add 1: 01000 + 1 = 01001 = 9, so −9.');
q(3,3,'Number systems','8A₁₆ + 101101₂ is equal to',
  ['11101011₂','275₁₀','BA₁₆','183₁₀','AB₁₆'],4,
  '8A₁₆ = 138 and 101101₂ = 45, so the sum is 183₁₀ (B7₁₆).');
q(4,4,'Boolean algebra','Simplifying the Boolean expression A.B + A.B.C + A.B.C.D + A.B.C.D.E + A.B.C.D.E.F gives which of the following?',
  ['A.B.C.D.E.F','A.B','A.B + C.D + E.F','A + B + C + D + E + F','A + B.(C + D.(E + F))'],2,
  'By absorption, A.B + A.B.X = A.B for any X, so every later term is absorbed into A.B.');
q(5,4,'Karnaugh maps','Identify the simplest SOP expression from the K-map shown.',
  ['Ā + B̄','C̄ + D̄','Ā + A.B̄','Ā.C̄ + Ā.C + A.B̄','Ā.B̄ + C'],1,
  'The columns AB = 00 and 01 (A = 0) are all 1s → Ā. The columns AB = 00 and 10 (B = 0) are all 1s → B̄. F = Ā + B̄; Ā + AB̄ means the same but is not the simplest.',
  {code:'        AB=00  AB=01  AB=11  AB=10\nCD=00     1      1      0      1\nCD=01     1      1      0      1\nCD=11     1      1      0      1\nCD=10     1      1      0      1',fixed:true});
q(6,4,'Logic circuits','Consider the following logic circuit built only from NOR gates. The circuit is equivalent to a/an',
  ['XNOR gate','AND gate','XOR gate','NAND gate','NOR gate'],3,
  'P = A̅ and R = B̅, so S = NOR(A̅, B̅) = A·B. T = NOR(A, B) = A̅·B̅. Q = NOR(S, T) = (AB + A̅B̅)̅, the complement of XNOR, which is XOR.',
  {code:'P = NOR(A, A)\nR = NOR(B, B)\nS = NOR(P, R)\nT = NOR(A, B)\nQ = NOR(S, T)'});
q(7,4,'Flip-flops','Which of the following input combinations is not allowed in an S-R flip-flop?',
  ['S = 0, R = 0','S = 0, R = 1','S = 1, R = 0','S = 1, R = 1','None of the above'],4,
  'Setting and resetting at the same time (S = R = 1) gives an invalid, undefined state.',F);
q(8,5,'File systems','Consider the following statements about file storage management.\nA. External fragmentation occurs in contiguous allocation.\nB. In linked allocation, a block is kept which contains the details of where the parts of a file are located.\nC. Only sequential access can be used to read a record in a file stored using indexed allocation.\nWhich of the above is/are correct?',
  ['A only','B only','A and B only','All A, B and C','None of them'],1,
  'Contiguous allocation leaves gaps (external fragmentation). A block listing where every part is stored is indexed allocation, not linked; and indexed allocation allows direct access.',{fixed:true,edited:true});
q(9,5,'Multitasking','Which of the following operating systems does not truly implement multitasking?',
  ['Windows XP','Windows 98','MS-DOS','Windows NT','Linux'],3,
  'MS-DOS runs one program at a time. The others are multitasking systems.');
q(10,5,'File systems','Which is the correct statement about file systems?',
  ['The File Allocation Table (FAT) file system is suitable for handling high-capacity files.','The New Technology File System (NTFS) is a free and open-source file system.','NTFS keeps two copies of each file for security.','NTFS is compatible with the Unicode system.','FAT is an enhanced file system of NTFS.'],4,
  'NTFS stores file names in Unicode. FAT has small size limits, NTFS is Microsoft’s own system, and NTFS is the newer, enhanced one.',{edited:true});
q(11,5,'Virtual memory','The division of a program in virtual memory into fixed-size parts is called ______ and each part is known as a ______. A data structure used by the processor, where each ______ is stored in physical memory, to keep a description of the program is called ______. Which option gives the words in order?',
  ['Framing, Frame, Page, Action Control Segment','Pagination, Page, Frame, Page Table','Pagination, Page, Frame, Action Control Segment','Wrapping, Page, Frame, Table Of Pages','Pagination, Page, Frame, Wrapping Blocks'],2,
  'Virtual memory is divided into pages (paging); physical memory into frames; the page table records which frame holds each page.');
q(13,6,'Protocols','Which of the following statements is not valid with respect to ICMP (Internet Control Message Protocol)?',
  ['It reports all errors which occur during transmission.','A redirect message is used when a router notices that a packet seems to have been routed wrongly.','It informs routers when an incorrect path has been taken.','The "destination unreachable" message is used when a router cannot locate the destination.','ICMP works with the Internet Protocol (IP), which defines how computers send packets of data to each other.'],1,
  'ICMP reports many problems (unreachable host, redirects, time exceeded), but not every error — for example lost or corrupted data is handled by TCP. (The original asked which “could be valid”.)',{edited:true,chk:true});
q(14,6,'Transmission media','What kind of transmission medium is most appropriate to carry data in a computer network that is exposed to electrical interference?',
  ['Unshielded twisted pair','Optical fibre','Coaxial cable','Microwave','Infrared'],2,
  'Optical fibre carries light, so electrical (electromagnetic) interference does not affect it.');
q(15,6,'Cryptography','Consider the following statements about data encryption.\nA. In symmetric key encryption, the same key is used for encryption and decryption.\nB. The main purpose of encryption is to add legal validity to an electronic document.\nC. In asymmetric key encryption, a message encrypted with the sender’s private key is more securely decrypted with the receiver’s public key.\nWhich of the above is/are correct?',
  ['A only','B only','A and B only','A and C only','All A, B and C'],1,
  'Symmetric encryption uses one shared key. Encryption is for confidentiality (legal validity comes from digital signatures), and a message encrypted with the sender’s private key is opened with the sender’s public key.',F);
q(17,7,'DFD','Which of the following level 1 data flow diagrams is correct according to the rules of data flow modelling? (The diagrams are shown in order (1) to (5) from top to bottom.)',
  ['Diagram (1)','Diagram (2)','Diagram (3)','Diagram (4)','Diagram (5)'],2,
  'Data must pass through a process: (2) goes data store → process → data store. The others connect an entity or a store directly to a store or another entity.',{img:IMG('royal22-17'),fixed:true});
q(18,12,'Information systems','A company wants information system software to manage day-to-day business activities such as accounting, procurement, project management, risk management and compliance, and supply chain operations. Which information system is most suitable?',
  ['Office Automation System','Knowledge Management System','Enterprise Resource Planning System','Content Management System','Transaction Processing System'],3,
  'An ERP system brings accounting, purchasing, projects and the supply chain of a whole organisation into one integrated system. (Option 5 repeated option 2 in the original.)',{edited:true});
q(19,7,'Database design','Which of the following statements is correct regarding the entity matrix used in information system design?',
  ['It shows the number of occurrences of each entity participating in a given relationship.','It helps to identify the relationships among entities.','The entity matrix is constructed after creating the logical data structure.','It helps to discover new entities and merge existing entities.','It shows whether the relationship exists for all occurrences of participating entities.'],2,
  'An entity (grid) matrix lists the entities on both axes and marks which pairs are related — a first step towards the logical data structure.',{chk:true});
q(20,7,'SDLC models','A software company is asked to develop a learning management system for a school. The system must accommodate upcoming requirements, with a new version every year. Which SDLC models are most suitable?\nA – Spiral model\nB – Agile model\nC – Rapid Application Development model',
  ['A only','B only','A and B only','B and C only','All A, B and C'],3,
  'Spiral and agile are iterative models built for changing requirements and repeated releases. RAD aims at one quick delivery of a well-understood system.',{fixed:true,chk:true});
q(21,8,'ER diagrams','In this ER diagram one customer can purchase more than one product and a product can be purchased by more than one customer. The database also needs to store the expiry date and manufactured date of each product and the purchase dates of products by customers. Which statement is false?',
  ['When mapping this into a relational schema, a separate relation should be created for the Purchases relationship.','FName and LName belong to the composite attribute Name.','According to this ER diagram, some products may not be purchased by any customer.','The dates on which a product is purchased cannot be found from this ER diagram.','The expiry date and manufactured date should be attributes of the relationship.'],5,
  'Expiry and manufactured dates describe the product itself, so they belong to Product. The purchase date is what belongs on the Purchases relationship.',{img:IMG('royal22-21'),fixed:true,chk:true});
q(24,8,'SQL','Consider the relation Employee(EID, Ename, Salary, City, Postal_Code). Suppose another column called Email has to be added. Which statements are true?\nA. To add the new field, the SQL ALTER command should be used.\nB. To put data into that field for existing rows, the SQL UPDATE command should be used.\nC. The primary key EID can be assigned at the time of creation or after the relation Employee is created.',
  ['A only','A and B only','A and C only','B and C only','All A, B and C'],5,
  'ALTER TABLE adds the column, UPDATE fills it for the rows already there, and a primary key can be declared in CREATE TABLE or added later with ALTER TABLE.',{fixed:true,chk:true});
q(25,8,'SQL','Using the relation Employee(EID, Ename, Salary, City, Postal_Code), what SQL query gets the name of the employee who earns the maximum salary?',
  ['SELECT Ename FROM Employee WHERE Salary = (SELECT MAX(Salary) FROM Employee);','SELECT Ename FROM Employee GROUP BY MAX(Salary);','SELECT Ename FROM Employee ORDER BY MAX(Salary);','SELECT Ename FROM Employee WHERE Salary = MAX(Salary);','SELECT Ename FROM Employee WHERE Salary AS MAX(Salary);'],1,
  'An aggregate such as MAX cannot be used directly in WHERE, so a subquery finds the maximum salary first.');
q(26,8,'Normalization','Nimal mapped the ER diagram shown into the following relations, assuming that a patient will not purchase the same drug on the same date and that City is identified by PostalCode:\n1. Drug(DrugID, DrugName, ManufacturedDate, ExpiredDate)\n2. Patient(PatientID, PatientName, Gender, PostalCode, City)\n3. Patient_Drug(PatientID, DrugID, Date, Quantity)\nWhich is/are correct about the above relations?\nA. The first table is in 3NF.\nB. The second table is in 2NF.\nC. The attribute Quantity of Patient_Drug is partially dependent on PatientID.',
  ['A only','B only','A and B only','B and C only','All A, B and C'],3,
  'Drug has only key-dependent attributes (3NF). In Patient, City depends on PostalCode — a transitive dependency, so it is 2NF but not 3NF. Quantity depends on the whole key, not on PatientID alone.',{img:IMG('royal22-26'),fixed:true});
q(27,8,'SQL','Which is true about the following SQL commands?',
  ['DROP DATABASE is a DML command.','DELETE table table_name; can be used to delete a table.','DELETE FROM table_name; will delete all the records of the table.','The ALTER command cannot be used to change a column definition.','The DELETE command is faster than the TRUNCATE command in MySQL.'],3,
  'DELETE FROM without WHERE removes every row but keeps the table. DROP is DDL, a table is removed with DROP TABLE, ALTER can change columns, and TRUNCATE is faster than DELETE.');
q(28,8,'Normalization','Student (StudentID, CourseID, Sname, Marks, Phone_no)\nA student can apply for more than one course, there are many students in each course, and the institute keeps at least two contact numbers for each student. In which normal form is this table?',
  ['0NF because partial dependencies exist','1NF because a primary key cannot be declared','0NF because of the multivalued attribute Phone_no','3NF because there are no transitive dependencies','2NF as there are no partial dependencies'],3,
  'Phone_no holds more than one value per student, so the values are not atomic — the table is not even in 1NF.');
q(29,9,'Python strings','What will be the output of the following Python code?',
  ['The name length of Lorie is 5 charaters\nThe name length of William is 7 charaters','The name length of %-3s Lorie is %d charaters\nThe name length of %-3s William is %d charaters','The name length of Lorie is 12 charaters\nThe name length of William %d is 7 charaters','The name length of Lories is 6 charaters\nThe name length of williams is 8 charaters','The name length of is charaters\nThe name length of is charaters'],1,
  '%-3s inserts the name (left-aligned, at least 3 wide) and %d its length: Lorie has 5 letters, William 7.',
  {code:'names = ["Lorie", "William"]\nfor x in names:\n    print("The name length of %-3s is %d charaters" % (x, len(x)))',fixed:true});
q(30,9,'Python operators','What would be the output after executing the following Python code?',
  ['0','200','1836','680','400'],4,
  '38 & 50 = 34, 38 | 25 = 63, 34 % 63 = 34, and 38 ^ 50 = 20. 34 × 20 = 680.',{code:'X = 38\nY = (X & 50) % (X | 25) * (X ^ 50)\nprint(Y)'});
q(31,9,'Python functions','What is the result of the following Python code?',
  ['12','3','5','6','2'],4,
  'The function is recursive: example(3) = 3 × example(2) = 3 × 2 × example(1) = 6 — the factorial of 3.',
  {code:'def example(a):\n    if a == 1:\n        return 1\n    else:\n        return a * example(a - 1)\nprint(example(3))'});
q(32,9,'Python loops','What is the output when the following code is executed?',
  ['0\n1\n1\n2\n3\n5\n8','0\n1\n1\n2\n3\n5','1\n2\n3\n5\n8\n13','1\n2\n3\n4\n5\n6','1\n3\n5\n7\n9'],1,
  'This prints the Fibonacci numbers while a < 10: 0, 1, 1, 2, 3, 5, 8.',{code:'a, b = 0, 1\nwhile a < 10:\n    print(a)\n    a, b = b, a + b',fixed:true});
q(33,9,'Python loops','What number pattern is printed when the following code is executed?',
  ['1\n2 1\n3 2 1\n4 3 2 1\n5 4 3 2 1','1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5','1 2 3 4 5\n1 2 3 4 5\n1 2 3 4 5\n1 2 3 4 5\n1 2 3 4 5','5 4 3 2 1\n4 3 2 1\n3 2 1\n2 1\n1','1\n1 2 1\n1 3 3 1\n1 4 6 4 1'],4,
  'For i = 0 the inner loop counts down from 5 to 1; each row starts one lower, and the last row (i = 5) is empty.',
  {code:"n = 5\nk = 5\nfor i in range(0, n + 1):\n    for j in range(k - i, 0, -1):\n        print(j, end=' ')\n    print()",fixed:true});
q(34,9,'Flowcharts','Using the flowchart shown, what would be the output if list A = 1, 2, 3, 4, 5 and list B = 3, 4, 5, 6, 7?',
  ['3','5','1, 2','3, 4, 5','9'],1,
  'Every element of A is compared with every element of B and Total counts the matches: 3, 4 and 5 — so 3 is printed.',{img:IMG('royal22-34'),fixed:true});
q(35,9,'Python lists','Which of the given Python programs implement the algorithm in the flowchart?',
  ['Only A','Only B','Only A and B','Only A and C','All A, B and C'],4,
  'A and C both count the equal pairs. B assigns to a[i] and b[i] before the lists or i exist, which raises an error.',{ctx:{text:FLOW,img:IMG('royal22-34')},fixed:true});
q(36,9,'Flowcharts','What is the purpose of the algorithm in the flowchart?',
  ['Output the numbers in list A that are larger than in list B','Output the number of elements in list A','Output the number of elements in list B','Output the number of elements that are in both lists A and B','Output the elements that are in both lists A and B'],4,
  'It adds 1 to Total for each pair of equal elements, so it outputs how many elements the two lists have in common — a count, not the elements themselves.',{img:IMG('royal22-34')});
q(37,9,'Python lists','Which expression is suitable for the blank to get \'r\' as the output?',
  ['x[2]','x[1][2]','x[0][2]','x[0][0]','x[1][0]'],3,
  'x[0] is the list n = [\'p\',\'q\',\'r\'] and its index 2 is \'r\'.',{code:"a = [1, 2, 3, 4]\nn = ['p', 'q', 'r']\nx = [n, a]\nprint(........)"});
q(38,9,'Python loops','What will be the output of the following Python code?',
  ['Square of a number 2 is 4\nSquare of a number 3 is 9\nSquare of a number -11 is 121\nSquare of a number 7 is 49\nSquare of a number 12 is 144','Square of a number 2 is 4\nSquare of a number 3 is 9\nSquare of a number 7 is 49\nSquare of a number 12 is 144','Square of a number 2 is 4\nSquare of a number 3 is 9','Square of a number 7 is 49\nSquare of a number 12 is 144','Null'],3,
  '2 and 3 are printed. At −11 the condition numbers[i] < 0 is true and break ends the loop.',
  {code:"numbers = [2, 3, -11, 7, 12]\nfor i in range(len(numbers)):\n    if numbers[i] < 0:\n        break\n    if numbers[i] > 10:\n        continue\n    square = numbers[i] * numbers[i]\n    print('Square of a number', numbers[i], 'is', square)",fixed:true});
q(39,10,'HTML links','Consider the following HTML links:\nA. <a href="Royal College.html" target="_blank">School</a>\nB. <a href="Royal College.html" target="_self">School</a>\nC. <a href="Royal College.html">School</a>\nWhich of them display the new web page in the same window as the previous page when the link School is clicked?',
  ['A and B only','B only','A only','B and C only','A and C only'],4,
  '_self (which is also the default when target is left out) opens the page in the same window; _blank opens a new tab. (The original wrote target="self" without the underscore.)',{edited:true,fixed:true});
q(40,10,'CSS','What is correct about the rendered result of the following HTML/CSS code?',
  ['"Royal College, Colombo 07" is displayed in red.','"ICT Section" and "Robotics and AI" are both displayed in red.','"Royal College, Colombo 07" is displayed in the centre of the web page.','"ICT Section" and "Robotics and AI" are both displayed in the same font size.','An error will be displayed on the web page.'],2,
  'The class .center applies only to the h2 and the p, making both red and centred. The h1 keeps default styling, and h2 is larger than p.',
  {code:'<html>\n<head>\n<style>\n  .center {\n    text-align: center;\n    color: red; }\n</style>\n</head>\n<body>\n  <h1>Royal College, Colombo 07</h1>\n  <h2 class="center">ICT Section</h2>\n  <p class="center">Robotics and AI</p>\n</body>\n</html>'});
q(41,10,'PHP','Consider the following PHP code and select the correct output.',
  ['The number is: 1\nThe number is: 5','The number is: 1\nThe number is: 10','The number is: 1\nThe number is: 6','Infinite loop','The number is: 5'],3,
  '$x starts at 1 and goes up by 5: 1, 6, then 11 stops the loop.',{code:'<?php\nfor ($x = 1; $x <= 10; $x += 5) {\n    echo "The number is: $x <br>";\n}\n?>'});
q(42,12,'E-commerce','The digital economy is based on digital technologies and covers all economic transactions that occur on the internet. Which of the following is not a new business method in the digital economy?',
  ['Reverse auction','Group purchasing','Pure brick','E-marketplaces','Buyers and sellers negotiating online'],3,
  'A pure brick business operates only through physical shops, with no online presence.');
q(44,12,'E-commerce','Electronic commerce is the buying and selling of goods over the internet between businesses and consumers. Which of the following are the three basic types of electronic commerce?',
  ['B2C, C2C and B2B','e-banking, e-trading and e-tailing','web auctions and web storefronts','cheque, credit card and electronic cash','B2C, e-banking and e-trading'],1,
  'E-commerce is classified by who trades with whom: business-to-consumer, consumer-to-consumer and business-to-business.');
q(45,6,'Mobile communication','Consider the following statements:\nA – The transmission of information over a distance without the help of wires or cables.\nB – The transmission of data, voice and video via a wireless-enabled device.\nWhich of the following correctly names A and B respectively?',
  ['Mobile communication and Cloud computing','Cloud computing and Mobile computing','Mobile communication and Mobile computing','Mobile computing and Cloud computing','Cloud computing and Mobile communication'],3,
  'Sending information without wires is (mobile/wireless) communication. Using a wireless device to send data, voice and video is mobile computing.',{chk:true});
q(46,2,'Input devices','Which of the following is the mechanical or electronic conversion of images of typed, handwritten or printed text into machine-encoded text, from a scanned document or a photo?',
  ['MICR','OCR','Barcode reader','OMR','Trackball'],2,
  'Optical Character Recognition turns images of text into editable text.');
q(47,13,'Emerging trends','Which of the following basic cloud service models provides access to fundamental resources such as physical machines, virtual machines and virtual storage?',
  ['IaaS','PaaS','SaaS','IaaS and PaaS','PaaS and SaaS'],1,
  'Infrastructure as a Service rents out the raw resources — servers, virtual machines and storage.');
q(48,13,'Quantum computing','Which of the following is correct regarding the quantum computer’s role in artificial intelligence?',
  ['Artificial intelligence will evolve to become self-aware.','Artificial intelligence will instantly solve optimisation problems.','Machine learning algorithms will be eliminated completely.','Machine learning algorithms will become much faster.','None of the above.'],4,
  'Quantum computers are expected to speed up heavy computations such as training machine-learning models. They do not make AI self-aware or solve everything instantly.');
q(50,13,'Artificial intelligence','Which of the following is true for neural networks?\nA – The training time depends on the size of the network.\nB – Neural networks can be simulated on a conventional computer.\nC – Artificial neurons are identical in operation to biological ones.',
  ['A only','B only','A and B only','B and C only','All A, B and C'],3,
  'Bigger networks take longer to train, and neural networks normally run as software on ordinary computers. Artificial neurons are only a simple model of biological ones.',F);
})();
