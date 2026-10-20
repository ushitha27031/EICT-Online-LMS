/* Sirimavo Bandaranaike Vidyalaya, Colombo 07 — Grade 13 Second Term Test, August 2022. ICT Paper I, English medium.
   41 of its 50 MCQs, typed from a scanned paper: Q13 and Q22 (more than one answer) are left out, and
   Q44–Q50 repeat the school's 2019 paper (already in sp-sbv19.js). The pencil marks on the scan are not
   trusted: the answers were worked out by EICT, and the ones marked chk are worth a second look.
   Format: see pp-si-2022.js (src/sch name the school paper). */
(function(){
const P=window.EICT_PP=window.EICT_PP||{si:[],en:[]};P.en=P.en||[];
const K='sbv22', S='Sirimavo Bandaranaike Vidyalaya · G13 Term 2 · 2022', Y=2022;
const q=(n,u,t,text,opts,ans,why,x)=>P.en.push(Object.assign({id:'en-'+K+'-'+String(n).padStart(2,'0'),y:Y,n,u,t,src:S,sch:K,text,opts,ans,why},x||{}));
const IMG=f=>'pp/en/'+f+'.png';
const F={fixed:true};
const EMP='The ER diagram shows the entity EMPLOYEE with the attributes Phone_No, Emp_No, EmpName (made of FirstName and LastName), DOB and Age (drawn dashed).';

q(1,2,'Computer history','Consider the following statements about computer generations.\nA – Second generation computers are based on transistors.\nB – First generation computers are based on ICs.\nC – Second generation computers used magnetic drums for primary memory.\nD – The IBM 360 is an example of a second generation computer.\nWhich of the above statement(s) is/are true?',
  ['A only','A and B only','B and C only','A and C only','C and D only'],1,
  'Second generation machines used transistors and magnetic core memory. Magnetic drums belong to the first generation, ICs to the third, and the IBM 360 was a third generation computer.',F);
q(2,3,'Number representation','The 8-bit two’s complement representations of 10₁₀ and −30₁₀ are',
  ['00001010, 00011110','11110101, 11100001','00001010, 11100001','00001010, 11100010','11110110, 11100010'],4,
  '10 = 00001010. For −30: 30 = 00011110, invert → 11100001, add 1 → 11100010.',F);
q(3,4,'Logic circuits','What is the logical equivalent of the given logic circuit (all the gates are NOR gates)?',
  ['AND','OR','NAND','NOR','XNOR'],3,
  'The two NOR gates with tied inputs give A̅ and B̅. NOR(A̅, B̅) = A·B, and the last NOR with tied inputs inverts it: (A·B)̅ — a NAND gate.',{img:IMG('sbv22-03'),chk:true});
q(4,2,'Memory','Consider the following statements about Erasable Programmable Read Only Memory (EPROM).\nA – It needs periodic refreshing.\nB – An EPROM chip can be programmed, erased and re-programmed only once.\nC – Ultraviolet light is used to erase the contents of the chip.\nWhich of the above statement(s) is/are correct?',
  ['B only','A and B only','A and C only','B and C only','C only'],5,
  'EPROM is erased with ultraviolet light and can be reprogrammed many times. Refreshing is needed by DRAM, not by EPROM.',F);
q(5,4,'Boolean algebra','(P + Q̅ + R̅)·(P + Q̅R) is equivalent to\nA – (P + Q̅)·(P + Q)\nB – P·(Q̅ + R)\nC – P + Q̅R',
  ['A only','B only','C only','A and B only','All A, B and C'],3,
  'Factor out P: P + (Q̅ + R̅)(Q̅R) = P + Q̅R + R̅Q̅R = P + Q̅R, because R̅R = 0. (A) simplifies to P.',F);
q(6,9,'Python selection','What is the output of the following Python code?',
  ['6','40','10','4','2'],2,
  'a < b is False, so the else branch runs: b *= a makes b = 40.',{code:'a = 10\nb = 4\nif a < b and a != 4:\n    a -= b\n    print(a)\nelse:\n    b *= a\n    print(b)'});
q(7,9,'Python data types','Which of the following is an incorrect statement regarding variables in Python programming?',
  ['Variables are used to store values temporarily when a program executes.','Keywords cannot be used as variable names.','The value of a variable cannot be changed.','Declaration of a variable is not required in Python.','Variables use memory space in main memory.'],3,
  'A variable can be given a new value at any time — that is why it is called a variable.');
q(8,7,'Deployment','A new automated school management information system is to replace a manual system. The principal thinks it is not safe to stop the existing manual system completely and start the new system at once. Which implementation methods suit this?',
  ['Direct implementation only','Direct or phased implementation','Parallel or phased implementation','Parallel or direct implementation','Direct or pilot implementation'],3,
  'Parallel running keeps the old system going alongside the new one, and phased implementation replaces it part by part. Direct changeover stops the old system at once.',{edited:true,chk:true});
q(9,6,'Network security','Consider the following statements.\nA – Symmetric key encryption is a process where the same key is used for encrypting and decrypting the information.\nB – Phishing is a type of social engineering attack often used to steal user data such as user names and passwords.\nC – NAT is a method of mapping between users and computers.\nD – The application layer handles addressing and delivering of data.\nWhich of the above statements are correct?',
  ['A, B and C','A and B','A and C','C and D','All of the above'],2,
  'NAT maps private IP addresses to public ones, not users to computers, and addressing/delivery is done by the network and transport layers.',F);
q(10,1,'Data & information','Consider the following:\nA – Decision making\nB – Accuracy\nC – Policy making\nD – Predictions\nE – Errors\nWhich of the above are applications (uses) of information?',
  ['A, B and C','A and B','A, B and D','A, C and D','All of the above'],4,
  'Information is used for making decisions and policies and for making predictions. Accuracy is a quality of information, and errors are not a use. (Options 1 and 3 were the same in the original.)',{fixed:true,edited:true,chk:true});
q(11,9,'Python operators','What is the output of the following Python expression?\n4*7%3**3+(5-2)',
  ['5','30','6','3','4'],5,
  '** first: 3**3 = 27. Then 4*7 = 28 and 28 % 27 = 1. Finally 1 + 3 = 4.');
q(12,10,'HTML lists','What is the output of the following HTML code?',
  ['Output (1)','Output (2)','Output (3)','Output (4)','Output (5)'],1,
  'The outer list is lettered (A, B), the nested list uses small Roman numerals (i, ii), and the unordered list with type="disc" shows filled bullets.',
  {code:'<OL type="A">\n  <LI> Flowers</LI>\n  <OL TYPE="i">\n    <LI>Rose</LI>\n    <LI>Anthurium</LI>\n  </OL>\n  <LI> Animals</LI>\n  <UL type="disc">\n    <LI> Giraff</LI>\n    <LI> Lion</LI>\n  </UL>\n</OL>',img:IMG('sbv22-12'),fixed:true});
q(14,13,'Multi-agent systems','Which of the following describes the proactiveness of a software agent?',
  ['Being responsive to changes in the environment','Capability of acting independently','Ability to cooperate with others','Goal-directed behaviour','Ability to improve performance over time'],4,
  'A proactive agent takes the initiative to reach its goals. Responding to changes is reactivity, acting independently is autonomy, and cooperating is social ability.',{chk:true});
q(15,5,'Process states','A running process will move to the blocked state due to ……………',
  ['Timeout','I/O waiting','Dispatch','Swapping','Temporary stop'],2,
  'A process that must wait for an I/O operation is blocked. A timeout sends it back to ready.');
q(16,9,'Python functions','What is the output when the following Python code is executed?',
  ['[1, 44]','[1, 2, 3, 44]','[44, 3, 2]','[1, 2, 3]','[44, 2, 3]'],5,
  'A list is passed by reference, so the function changes the original list: its first element becomes 44.',{code:'def f(values):\n    values[0] = 44\nv = [1, 2, 3]\nf(v)\nprint(v)'});
q(17,10,'CSS','The correct syntax used to define a border in CSS is',
  ['p {border: 5px solid red;}','p {border-style: 5px solid red;}','p {bordertype: 5px solid red;}','p {border-type: 5px solid red;}','p {border-family: 5px solid red;}'],1,
  'The shorthand property border takes the width, style and colour together.');
q(18,13,'Emerging trends','Consider the following:\nA – Customisation of automobiles\nB – Customisation of lighting systems in houses\nC – Tracking a location in an unknown environment\nD – Automatic detection of possible attempts at crime\nWhich can be considered applications of ubiquitous computing?',
  ['A only','A and B only','A and C only','A, B and C only','All A, B, C and D'],5,
  'Ubiquitous computing puts computing into everyday objects and surroundings — cars, homes, location tracking and security monitoring are all examples.',{fixed:true,chk:true});
q(19,10,'PHP','What would be the output when the following PHP code is executed?',
  ['fruits are "apple" and "banana"','fruits are apple and banana','fruits are "banana" and "mango"','fruits are banana and mango','fruits are banana . and . mango'],4,
  'Arrays start at index 0, so $fruit[1] is banana and $fruit[2] is mango. The dots join the strings and are not printed.',
  {code:'<?php\n$fruit = array("apple", "banana", "mango");\necho "fruits are " . $fruit[1] . " and " . $fruit[2];\n?>'});
q(20,10,'CSS','Consider the following three CSS rules. Which of the following lists the selectors used, in order?',
  ['id, element and class','element, id and class','class, id and element','id, class and element','element, class and id'],2,
  'p is an element (type) selector, #para1 an id selector and .center a class selector.',
  {code:'(1) p {\n      text-align: center;\n      color: red;\n    }\n(2) #para1 {\n      text-align: center;\n      color: red;\n    }\n(3) .center {\n      text-align: center;\n      color: red;\n    }'});
q(21,3,'Number systems','What is the correct decimal equivalent of hexadecimal 194.8₁₆?',
  ['88.5₁₀','404.5₁₀','404.8₁₀','129.5₁₀','129.8₁₀'],2,
  '1×256 + 9×16 + 4 = 404, and .8₁₆ = 8/16 = 0.5, so 404.5.');
q(23,7,'SDLC models','Which of the following is/are true about systems development methodologies?\nA – The agile model promotes continuous iteration of development and testing throughout the project.\nB – The prototype model does not support system modifications while it is being developed.\nC – The waterfall model is ideal when user requirements are not clear.\nD – In the RAD approach, various tools are used to increase the speed of development.',
  ['A only','B and C only','A and C only','A and D only','B, C and D'],4,
  'Agile iterates continuously and RAD uses tools to build quickly. Prototyping exists to allow changes, and waterfall needs clear requirements from the start.',F);
q(24,7,'DFD','Consider the data flow diagram. Which of the following correctly lists the incorrect data flows?',
  ['C, G, I','C, F, G','C, E, I','A, C, I','A, E, F'],1,
  'C goes from an external entity straight to a data store, G from one store to another, and I from a store to an external entity — all must pass through a process. A, between two external entities, may be shown.',{img:IMG('sbv22-24'),fixed:true,chk:true});
q(25,9,'Flowcharts','Consider the flowchart. Which of the following Python programs implement its behaviour?\nA:\nN1 = int(input())\nN2 = int(input())\nif not N1 % 2 == 0:\n    N1 = N1 + 1\nwhile N1 <= N2:\n    print(N1)\n    N1 = N1 + 2\nB: the same as A, but with  if N1 % 2 != 0:  N1 += 1\nC: the same as A, but with  if N1 % 2 == 0:  N1 = N1 + 1',
  ['A only','B only','B and C only','A and B only','All of the above'],4,
  'The flowchart adds 1 only when N1 is odd, then prints every second number up to N2 — the even numbers. A and B test for odd; C adds 1 to even numbers.',{img:IMG('sbv22-25'),fixed:true});
q(26,9,'Python loops','What would be the output of the following Python code?',
  ['1 2 3 1 2 3','1 2 3 4 1 2 3 4','3 2 1 3 2 1','3 2 1 end 3 2 1 end','3 2 3 2'],3,
  'The outer loop runs for t = 2 and t = 4. Each time the inner loop prints 3 2 1.',
  {code:"t = 2\nwhile t < 5:\n    k = 3\n    while k > 0:\n        print(k, end=' ')\n        k = k - 1\n    t = t + 2",fixed:true});
q(27,12,'E-commerce','Consider the following statements about B2B transactions.\nA – There is no communication with individual customers.\nB – Products and services are sold through the internet for the convenience of customers.\nC – It is a purchase and sale between two companies.\nD – It supplies goods and services of a company to its employees.\nWhich of the above is/are true?',
  ['B and C only','A, B and C only','A, C and D only','A only','A and C only'],5,
  'B2B is trade between businesses, so individual consumers are not involved. Selling to customers is B2C and supplying employees is B2E.',{fixed:true,edited:true,chk:true});
q(28,9,'Python files','Which of the following is a valid Python statement to open a file named "output.txt" for writing?',
  ['open = f1("output.txt", \'r\')','open = f1("output.txt", \'w\')','f1 = open("output.txt", \'r\')','f1 = open("output.txt", \'w\')','open = f1(\'w\', "output.txt")'],4,
  'open() takes the file name and then the mode; "w" opens it for writing. The result is stored in a variable (f1).');
q(29,6,'Network security','Match column A with column B.\nA – A student downloads an essay from the internet and submits it as his/her own work\nB – A trap set to detect, deflect or counteract attempts at unauthorised use of information\nC – Monitoring all the traffic passing through a node and picking off the contents of unencrypted communication\nD – Making illegal copies of software on which the user has no copyright or other right\n1 – Honey pots and sugarcanes   2 – Plagiarism   3 – Software piracy   4 – Eavesdropping',
  ['(a=4)(b=2)(c=3)(d=1)','(a=2)(b=4)(c=3)(d=1)','(a=2)(b=1)(c=4)(d=3)','(a=3)(b=1)(c=4)(d=2)','(a=1)(b=3)(c=2)(d=4)'],3,
  'Passing off others’ work is plagiarism, a trap is a honeypot, listening to traffic is eavesdropping, and illegal copying is software piracy.',F);
q(30,6,'Transmission','Which mode of operation is a modem using when it communicates in only one direction at a time?',
  ['Half-duplex','Full-duplex','Simplex','Full-simplex','None of the above'],1,
  'Half duplex allows both directions but only one at a time. Simplex is only ever one direction; full duplex is both at once.');
q(31,6,'Protocols','"…………… was created to overcome the problem of collisions that occur when packets are transmitted simultaneously from different computers."',
  ['IP','CSMA/CD','TCP','FTP','UDP'],2,
  'Carrier Sense Multiple Access with Collision Detection listens before sending and handles collisions on an Ethernet.');
q(32,6,'Network devices','Consider the following functions.\nA – Automatically provides and assigns IP addresses to client devices.\nB – Translates domain names to IP addresses as requested.\nC – Remaps one IP address space into another.\nD – Stores, processes and delivers web pages to web clients.\nIdentify the servers that perform functions A, B, C and D in order.',
  ['DHCP, Proxy, DNS, Web','DNS, DHCP, Proxy, Web','DHCP, DNS, Proxy, Web','Proxy, DNS, DHCP, Web','DNS, Proxy, DHCP, Web'],3,
  'DHCP assigns addresses, DNS resolves names, the proxy/NAT server maps the internal address space to an external one, and the web server serves pages.',{fixed:true,chk:true});
q(33,9,'Python data types','Consider the following assignment statements in Python:\nA – a = True\nB – x = \'nimal\'s name\'\nC – L1 = [\'amal\', 25, 17, 0]\nD – a, b = 1\nWhich of the above are syntactically correct Python statements?',
  ['A and C','B and D','A, B and C','A and D','A, B and D'],1,
  'The apostrophe in \'nimal\'s name\' ends the string early, and a, b = 1 tries to unpack a single integer into two names.',F);
q(34,8,'ER diagrams','Consider the following statements with respect to ER diagrams.\nA – An ER diagram has entities and relationships only.\nB – The cardinality of a relationship can be one-to-many.\nC – There can be attributes on a relationship.\nD – There cannot be ternary relationships.\nWhich of the above statements are correct?',
  ['A and B only','B and C only','A and C only','B, C and D only','A and D only'],2,
  'ER diagrams also show attributes, and ternary (three-entity) relationships are allowed. Relationships can be 1:N and can have their own attributes.',F);
q(35,9,'Python lists','Consider the following incomplete Python program. Which statement should be placed on the blank line to print the highest value in the list A?',
  ['A[i] = max','max = A[i]','max = A[0]','max = A[j]','max = len(A)'],2,
  'Whenever an element is larger than the current maximum, that element becomes the new maximum.',
  {code:'A = [10, 5, 67, 56, 4]\nmax = A[0]\nfor i in range(len(A)):\n    if A[i] > max:\n        ..................\nprint(max)'});
q(36,6,'Error detection','Host A broadcasts the message 01101111 using even parity (the LSB is the parity bit). Hosts B, C, D and E receive the following:\nB – 01100011\nC – 01101110\nD – 01111000\nE – 00101111\nFor which recipients does an error go undetected?',
  ['B and C','B and D','D only','C and E','All of the above'],2,
  'Every received message differs from 01101111, so all have errors. B and D still have an even number of 1s (4 each), so parity misses them; C and E have 5 ones and are caught.',F);
q(37,8,'Relational model','Consider the table STUDENT (INDEX_NO, NAME, DOB, SEX) and the following statements.\nA – Student is an entity.\nB – The INDEX_NO field can be used as the primary key.\nC – NAME and DOB are two attributes of the table.\nD – The collection of data in all the attributes of a certain student is called a record.\nWhich of the above statement(s) is/are true?',
  ['A and B only','B and C only','C and D only','A, B and C only','All of the above'],5,
  'The table stores the entity Student, INDEX_NO is unique, NAME and DOB are attributes, and one student’s full row is a record (tuple).',{fixed:true,chk:true});
q(38,6,'Addressing','Which of the following is a class C IP address?',
  ['191.1.1.10','224.5.6.4','121.8.7.5','223.4.3.10','192.5.1.9.8'],4,
  'Class C first octets are 192–223, so 223.4.3.10. 192.5.1.9.8 has five parts and is not an IPv4 address.');
q(39,6,'Subnetting','The IP address of a computer network is 192.168.2.10 and its subnet mask is 255.255.255.224. What is the maximum number of hosts that can be connected in the network?',
  ['64','62','32','128','30'],5,
  '.224 leaves 5 host bits: 2⁵ − 2 = 30 usable host addresses.');
q(40,8,'ER diagrams','Consider the ER diagram between Employee and Project. Which attribute is a stored attribute from which a derived attribute is calculated?',
  ['Phone_No','Emp_No','Age','FirstName','DOB'],5,
  'Age is derived (dashed) from the stored attribute DOB, so DOB is the stored attribute it depends on.',{ctx:{text:EMP},img:IMG('sbv22-40'),edited:true,chk:true});
q(41,8,'ER diagrams','In the same ER diagram, which is a composite attribute?',
  ['Phone_No','EmpName','Age','FirstName','DOB'],2,
  'EmpName is split into FirstName and LastName.',{ctx:{text:EMP},img:IMG('sbv22-40')});
q(42,8,'ER diagrams','In the same ER diagram, which is a derived attribute?',
  ['Phone_No','EmpName','Age','FirstName','DOB'],3,
  'Age is drawn with a dashed ellipse — it is calculated from DOB.',{ctx:{text:EMP},img:IMG('sbv22-40')});
q(43,8,'Relational model','In a database, a(n) ______ is a group of related fields.',
  ['Table','Key','Record','Primary field','Domain'],3,
  'Related fields about one item (one row) make up a record.');
})();
