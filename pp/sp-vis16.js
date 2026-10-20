/* Visakha Vidyalaya, Colombo 5 — Grade 13 Third Term Test, 2016. ICT Paper I, English medium.
   47 of its 50 MCQs, typed from a photographed paper: Q33 (no correct option), Q40 (more than one
   answer) and Q48 (two correct queries) are left out. There is no marking scheme: the answers were
   worked out by EICT, and the ones marked chk are worth a second look. Format: see pp-si-2022.js. */
(function(){
const P=window.EICT_PP=window.EICT_PP||{si:[],en:[]};P.en=P.en||[];
const K='vis16', S='Visakha Vidyalaya · G13 Term 3 · 2016', Y=2016;
const q=(n,u,t,text,opts,ans,why,x)=>P.en.push(Object.assign({id:'en-'+K+'-'+String(n).padStart(2,'0'),y:Y,n,u,t,src:S,sch:K,text,opts,ans,why},x||{}));
const IMG=f=>'pp/en/'+f+'.png';
const F={fixed:true};
const TABLES='Student\nStuID  | StdName           | StdClass | SCode\nST1487 | S.D.K. Jayasinghe | 10A      | Sub012\nST0568 | A.L. Kumari       | 10D      | Sub123\nST1876 | D.R. Jayathilaka  | 10H      | Sub123\n\nSubject\nSubCode | SubName\nSub123  | Dancing\nSub012  | Music\nSub135  | Art';

q(1,2,'Computer history','……………… technology was used in fourth generation computers.',
  ['Microprocessor','Transistor','Integrated circuit','Vacuum tube','Superconductor'],1,
  'Fourth generation computers are built around the microprocessor (VLSI). Vacuum tubes, transistors and ICs belong to the first three generations.');
q(2,2,'Memory','Consider the following memory types.\nA – Read Only Memory\nB – Registers\nC – Flash Memory\nD – Random Access Memory\nWhich of the above can be classified as volatile memory?',
  ['A and C','C and D','B and D','A and B','A and D'],3,
  'Registers and RAM lose their contents when the power goes off. ROM and flash memory are non-volatile.',F);
q(3,3,'Number systems','3D2₁₆ is equal to',
  ['1577₈','1752₈','1673₈','1722₈','1734₈'],4,
  '3D2₁₆ = 0011 1101 0010₂. Regrouped in threes: 001 111 010 010 = 1722₈ (both are 978).');
q(4,8,'Database design','Steps that are followed in designing a database are given below.\nA – Logical design\nB – Physical design\nC – Conceptual design\nThe correct sequence is',
  ['A, B, C','A, C, B','B, A, C','B, C, A','C, A, B'],5,
  'First a conceptual model (ER diagram), then the logical design (relations), and finally the physical design for a particular DBMS.',F);
q(5,10,'Web concepts','Which of the following can be used to store data temporarily on the user’s computer when accessing web pages?',
  ['Cache','Cookies','Frames','Sessions','Registers'],2,
  'A cookie is a small piece of data that a web site stores on the user’s computer (for example, a login or the items in a cart). Sessions are kept on the server.',{chk:true});
q(6,12,'E-commerce','When a product is purchased over the internet for business purposes, it is called',
  ['B2B','C2B','B2C','C2C','G2C'],1,
  'One business buying from another business is business-to-business (B2B).');
q(7,4,'Boolean algebra','The Boolean expression A’B + AB’ + AB is equivalent to',
  ['A + B','A’.B','(A + B)’','A + B’','A’ + B'],1,
  'AB’ + AB = A(B’ + B) = A, so the expression is A’B + A = A + B.');
q(8,2,'Storage','Which of the following statements is correct?',
  ['EPROM contents can be erased by exposing it to infrared rays.','An internal hard disk is more portable than an external hard disk.','Magnetic tape uses direct access.','PROM can be written only once.','Optical disks use serial access.'],4,
  'A PROM is programmed once and cannot be changed. EPROM is erased with ultraviolet light, tape is sequential access and optical disks are direct access.');
q(9,4,'Boolean algebra','What is the simplest form of (x + y)(x + z)?',
  ['x','x + x(y + z)','x(1 + yz)','x + yz','x.y.z'],4,
  'By the distributive law x + yz = (x + y)(x + z).');
q(10,4,'Logic circuits','What input combination of A, B, C makes the output x = 1 in the logic circuit shown?',
  ['1, 0, 1','0, 0, 1','1, 1, 1','0, 1, 1','0, 0, 0'],4,
  'x = (A ⊕ B) · (B ⊙ C) · C. C must be 1, then B XNOR C = 1 needs B = 1, and A XOR B = 1 needs A = 0: (0, 1, 1).',{img:IMG('vis16-10'),fixed:true,chk:true});
q(11,7,'Data validation','Choose the correct set of data validation methods for the following:\nA – The month of a person’s date of birth should lie between 1 and 12.\nB – A bank account number must always be 10 digits long.\nC – Customers must give their telephone numbers.',
  ['Range check / Length check / Presence check','Range check / Check digits / Type check','Check digits / Range check / Presence check','Type check / Length check / Presence check','Check digits / Length check / Presence check'],1,
  'A value between limits is a range check, a fixed number of characters is a length check, and a field that must be filled is a presence check.',F);
q(12,5,'OS functions','Which of the following is not a main function of an operating system?',
  ['Memory management','Process scheduling','File handling','User interfacing','Defragmentation'],5,
  'Defragmentation is done by a utility program. Managing memory, scheduling processes, handling files and providing the user interface are core OS functions.');
q(13,6,'Transmission','Which of the following statements about data communication is/are true?\nA – The physical layer changes bits into electromagnetic signals.\nB – Optical fibre has the highest data transmission speed.\nC – Bits can be sent over guided and unguided media as an analog signal by analog modulation.',
  ['Only A','Only B','Only C','A and B','All of the above'],5,
  'The physical layer turns bits into signals, fibre gives the highest speeds, and modulation sends data as analog signals over both cables and wireless.',{fixed:true,chk:true});
q(14,6,'Addressing','Which class of IP address provides a maximum of only 254 host addresses per network ID?',
  ['Class A','Class B','Class C','Class D','Class E'],3,
  'Class C has 8 host bits: 2⁸ − 2 = 254 hosts.');
q(15,6,'Transmission','Consider the following statements about communication.\nA – Half duplex communication always takes place in both directions at once.\nB – The Public Switched Telephone Network (PSTN) uses the half duplex method.\nC – Radio broadcasting uses the simplex communication method.\nWhich of the above statements is/are correct?',
  ['A only','B only','C only','A and B only','B and C only'],3,
  'Half duplex works in both directions but one at a time, and a telephone call is full duplex. A radio station only sends to listeners — simplex.',{fixed:true,edited:true,chk:true});
q(16,6,'Subnetting','What is the maximum number of IP addresses that can be assigned to hosts on a local subnet that uses the 255.255.255.224 subnet mask?',
  ['14','15','16','32','30'],5,
  '.224 = 11100000 leaves 5 host bits: 2⁵ − 2 = 30 usable host addresses.');
q(17,6,'OSI model','Which of the following statements is/are false?\nA – The network layer is concerned with bits.\nB – Routing is a function of the transport layer.\nC – A four-byte IP address consists of network and host addresses.',
  ['A only','B only','C only','A and B only','B and C only'],4,
  'Bits are the physical layer’s concern and routing is the network layer’s job, so A and B are false. C is true.',F);
q(18,6,'Protocols','ICMP is primarily used for',
  ['Error and diagnostic functions','Routing','Addressing','Forwarding','Framing'],1,
  'ICMP carries error messages and diagnostics — ping and traceroute use it.');
q(19,6,'DNS','Which of the following statements is true regarding DHCP and DNS servers?',
  ['A DHCP server provides an IP address to a client for an unlimited period.','DNS stands for Domain Name System.','DNS converts IP addresses into host names.','DHCP stands for Dynamic Host Control Protocol.','Both DNS and DHCP are not essential to use the Internet.'],2,
  'DNS = Domain Name System; it mainly turns host names into IP addresses. DHCP (Dynamic Host Configuration Protocol) leases addresses for a limited time.');
q(20,6,'Network devices','Which of the following is/are incorrect about networking devices?\nA – Repeaters are used in broadcasting.\nB – Repeaters cannot be used to connect segments of different network types.\nC – Bridges operate at the data link layer.\nD – Both repeaters and bridges can filter out noise.',
  ['A only','B only','D only','A and B only','C and D only'],3,
  'A repeater simply regenerates the signal — it cannot filter anything — and it only joins segments of the same type. Bridges work at the data link layer.',{fixed:true,chk:true});
q(21,6,'Transmission media','In which type of transmission impairment does the signal lose strength due to the resistance of the transmission medium?',
  ['Attenuation','Distortion','Noise','Modulation','Synchronization'],1,
  'Attenuation is the loss of signal strength as it travels through the medium.');
q(22,6,'Network security','Choose the correct set of threats for the following:\nA – Sending messages from a bogus e-mail address\nB – An e-mail message is intercepted and changed by another party\nC – Making a web server temporarily unavailable',
  ['Spoofing / Tampering / Denial-of-service','Phishing / Denial-of-service / Disclosure','Disclosure / Tampering / Phishing','Port scanning / Spoofing / Denial-of-service','Spoofing / Phishing / Denial-of-service'],1,
  'Faking the sender is spoofing, changing a message in transit is tampering, and making a server unavailable is denial of service.',F);
q(23,7,'DFD','Which statement describes the following component used in SSADM?',
  ['Manual 2nd data store, can be used in a context diagram','Digital 2nd data store, can be used in a level 1 DFD','Temporary 2nd data store, can be used in a level 1 DFD','Digital 2nd process, can be used in BAM','Digital 2nd process, can be used in a context diagram'],2,
  'An open box with an ID is a data store; D means a computerised (digital) store and M a manual one. Data stores never appear in a context diagram.',{img:IMG('vis16-23')});
q(24,9,'Python operators','What is the value of the expression 4+5+4**2-5*5?',
  ['50','55','41','42','0'],5,
  '** comes first (16), then * (25): 4 + 5 + 16 − 25 = 0.');
q(25,9,'Python strings','Given a string s = "Welcome", which of the following code is incorrect?',
  ['print(s[0])','print(s.lower())','s[1] = \'r\'','print(s.strip())','s.split()'],3,
  'Strings are immutable, so assigning to s[1] raises a TypeError.');
q(26,9,'Python data structures','Which of the following statements create a dictionary?\nA. d = {}\nB. d = {"john":40, "peter":45}\nC. d = {40:"john", 45:"peter"}\nD. d = (40:"john", 45:"peter")',
  ['A only','A and B','A, B and C','A, B, C and D','None of the above'],3,
  '{} is an empty dictionary, and B and C use key:value pairs in braces. D uses parentheses, which is a syntax error.',F);
q(27,9,'Python data structures','Suppose d = {"john":40, "peter":45}. Which command gives the number of entries in the dictionary?',
  ['d.size()','len(d)','size(d)','d.len()','d()'],2,
  'len() returns the number of key–value pairs.');
q(28,9,'Python files','What is the use of the seek() method in files in Python?',
  ['Sets the file’s current position at the offset','Sets the file’s previous position at the offset','Sets the file’s current position within the file','Seeks for a given character','None of the mentioned'],1,
  'f.seek(offset) moves the file pointer to the given offset.');
q(29,9,'Python files','What is the correct syntax of file.writelines()?',
  ['file.writelines(sequence)','fileObject.writelines()','fileObject.writelines(sequence)','file.object()','None of the mentioned'],3,
  'writelines is called on an open file object with a sequence (for example a list) of strings.');
q(30,9,'Python functions','What is returned by math.ceil(3.4) in Python?',
  ['3','4','4.0','3.0','3.4'],2,
  'ceil rounds up to the next whole number and, in Python 3, returns an int: 4.');
q(31,9,'Python functions','When a function that does not return any value is executed in the shell, what value does it return by default?',
  ['int','boolean','void','0','None'],5,
  'A function with no return statement returns None.');
q(32,9,'Python strings','What is the output of the following code?',
  ['rma','ramat','orma','orm','ormat'],1,
  'Slicing [4:7] takes the characters at index 4, 5 and 6 of "information": r, m, a.',{code:'>>> example = "information technology"\n>>> print("%s" % example[4:7])'});
q(34,9,'Algorithms','Consider the following bubble sort function. Which of the following is suitable to fill the blank?',
  ['temp','alist[i]','alist[passnum]','alist[i+1]','alist[passnum+1]'],1,
  'To swap two items, the first is saved in temp, the second is copied into the first, and temp is copied into the second.',
  {code:'def bubbleSort(alist):\n    for passnum in range(len(alist)-1, 0, -1):\n        for i in range(passnum):\n            if alist[i] > alist[i+1]:\n                temp = alist[i]\n                alist[i] = alist[i+1]\n                alist[i+1] = ........\n\nalist = [54, 26, 93, 17, 77, 31, 44, 55, 20]\nbubbleSort(alist)\nprint(alist)'});
q(35,8,'ER diagrams','The diagram shows part of an ER diagram. Which of the following is/are true regarding it?\nA – Address is a composite attribute\nB – Tel-num is a multivalued attribute\nC – Date_of_Birth is a derived attribute\nD – NIC is an atomic attribute',
  ['A only','B only','B and C only','B and D only','D only'],4,
  'Tel-num has a double ellipse (multivalued) and NIC is a simple key attribute. Address has no sub-attributes, and the derived attribute (dashed) is Age, not Date_of_Birth.',{img:IMG('vis16-35'),fixed:true});
q(36,10,'CSS','What is the correct CSS rule to set the font colour to red and the font to italic for a paragraph?',
  ['p{color:red; font-style:italic;}','p{color-red; text-style:\'italic\';}','p{fontcolor:red; font-style:italic;}','p{color=red; text-type=italic;}','p{font-color=red; font-type=italic;}'],1,
  'CSS uses property: value; pairs, and the properties are color and font-style.');
q(37,10,'HTML lists','Consider the part of a web page shown. Which elements are required to create it?',
  ['dd and dl','ul and li','ul, ol and li','dd, dt and dl','dl only'],4,
  'Terms (Coffee, Milk) with indented descriptions under them form a definition list: <dl> with <dt> and <dd>.',{img:IMG('vis16-37')});
q(38,9,'Flowcharts','Consider the flowchart and the following statements.\nA – If N = 4, the output will be 25.\nB – If the output is 6, N will be 4.\nC – This flowchart can be used to find the factorial of a number.\nD – Both repetition and decision are used.\nWhich are the correct statements?',
  ['A, C and D','B, C and D','C and D','A and C','B and C'],3,
  'F is multiplied by 1, 2, …, N, so the output is N!: 24 for N = 4, and an output of 6 comes from N = 3. The loop uses both a decision and repetition.',{img:IMG('vis16-38'),fixed:true});
q(39,5,'Process states','In a time-sharing operating system, when the time slot given to a process is completed, the process goes from the running state to the',
  ['Blocked state','Ready state','Suspended state','Terminated state','New state'],2,
  'When its time slice ends the process is pre-empted and goes back to the ready queue to wait for another turn.');
q(41,7,'SDLC','The statements below are associated with the SDLC. Identify the incorrect statement.',
  ['Logical design should be done before physical design.','The system analysis phase concerns what requirements need to be satisfied.','Modifications to the developed system are done in the maintenance stage.','The ER diagram is done in physical design.','File conversions are done in the system implementation stage.'],4,
  'An ER diagram is a conceptual/logical model, drawn before physical design.');
q(42,7,'Feasibility','The main objective of the feasibility study of an information system is',
  ['To assess whether it is possible to meet the requirement specifications','To assess if it is possible to meet the requirements specified subject to constraints of budget, human resources and hardware','To assist the management in implementing the desired system','To remove bottlenecks in implementing the desired system','None of the above'],2,
  'A feasibility study checks whether the requirements can be met within the available money, people and technology.');
q(43,10,'Web concepts','A web site which brings information together from diverse sources in a uniform way is called a',
  ['Market creator','Content provider','Web portal','Service provider','Community provider'],3,
  'A portal gathers information from many sources and presents it in one place.');
q(44,13,'Emerging trends','Attempting to improve a business by producing products or delivering services that fit consumers’ feelings, emotions, culture and profession is called',
  ['Emotional computing','Kansei Engineering','Artificial Intelligence','Ubiquitous Computing','None of the above'],2,
  'Kansei engineering translates customers’ feelings and impressions into product design.');
q(45,12,'Information systems','The process of capturing, developing, sharing and effectively using organisational knowledge is called',
  ['Content provider','Knowledge Management System','Management Information System','Content Management System','Web Portal'],2,
  'A Knowledge Management System captures and shares the knowledge of an organisation.');
q(46,8,'Relational model','Consider the Student and Subject tables. The degree of the Student table and the cardinality of the Subject table are respectively',
  ['4, 2','4, 3','3, 3','3, 2','2, 4'],2,
  'Degree is the number of columns (Student has 4) and cardinality is the number of rows (Subject has 3).',{code:TABLES});
q(47,8,'SQL','Which of the following queries is used to count the students in the Student table?',
  ['SELECT COUNT(ALL) FROM Student;','SELECT COUNT(*) FROM Student;','SELECT * FROM Student;','SELECT ALL FROM Student;','None of the above'],2,
  'COUNT(*) counts all the rows of the table.',{code:TABLES});
q(49,6,'Topologies','Which statement is false regarding LAN topologies?',
  ['Being easy to implement and extend is an advantage of the bus topology.','In a star topology, if any workstation goes down it does not affect the entire network.','One malfunctioning workstation can create problems for the entire network in a ring topology.','High fault tolerance is an advantage of the mesh topology.','A tree topology cannot be designed in many ways for various purposes.'],5,
  'A tree (hierarchical) topology is very flexible and can be arranged in many ways, so (5) is false.');
q(50,2,'Memory','Which of the following statements is incorrect?',
  ['Cache memory is volatile.','L2 cache is integrated with the processor core.','L2 cache buffers program instructions and data that the processor is about to request from memory.','L2 cache is slower than L1 cache.','The CPU accesses the system memory and then puts a copy of the new data in the cache before processing it.'],2,
  'L1 cache is built into each processor core. L2 is a separate, larger and slower cache (at the time on a separate chip or shared on the die).',{chk:true});
})();
