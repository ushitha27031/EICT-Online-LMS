/* Sirimavo Bandaranaike Vidyalaya, Colombo 07 — Grade 13 Second Term Test, March 2019. ICT Paper I, English medium.
   46 of its 50 MCQs: Q4 (no correct option), Q6 (unclear), Q7 (fifth option missing) and Q37 (too vague) are left out.
   There is no marking scheme: the answers were worked out by EICT, and the ones marked chk are worth a second look.
   Format: see pp-si-2022.js (src/sch name the school paper). */
(function(){
const P=window.EICT_PP=window.EICT_PP||{si:[],en:[]};P.en=P.en||[];
const K='sbv19', S='Sirimavo Bandaranaike Vidyalaya · G13 Term 2 · 2019', Y=2019;
const q=(n,u,t,text,opts,ans,why,x)=>P.en.push(Object.assign({id:'en-'+K+'-'+String(n).padStart(2,'0'),y:Y,n,u,t,src:S,sch:K,text,opts,ans,why},x||{}));
const IMG=f=>'pp/en/'+f+'.png';
const F={fixed:true};
const ABC=['A only','B only','C only','A and B only','All A, B and C'];
const REL={text:'Consider the following relations:\nteacher (teacher_id, teacher_name, date_of_birth, author_id)\nbook (book_id, book_name)\nauthor (author_id, author_name, email_address)\nauthorOfbook (author_id, book_id)\npublisher (publisher_id, publisher_name, contact_number, email)\npublisherOfbook (publisher_id, book_id)\nteacher_id, book_id, author_id and publisher_id are unique attributes in the relations teacher, book, author and publisher respectively.'};

q(1,2,'Computer history','Who invented the Analytical Engine?',
  ['Alan Turing','Charles Babbage','Gottfried Wilhelm Leibniz','Von Neumann','John Vincent Atanasoff'],2,
  'Charles Babbage designed the Analytical Engine in the 1830s — the first design of a general-purpose programmable computer.');
q(2,2,'Computer history','Which of the following statements is true about computers developed during the past?',
  ['Transistors are used in the first generation computers.','Assembly languages are used as the programming language in the first generation computers.','Vacuum tubes are used in the second generation computers.','Integrated circuits are used in the third generation computers.','Assembly language programs cannot be executed on the third generation computers.'],4,
  'First generation: vacuum tubes and machine language. Second: transistors. Third: integrated circuits.');
q(3,3,'Number representation','What is the two’s complement representation of the decimal 54, if an integer is represented by 8 bits?',
  ['01010110','00110110','01010010','00010110','01001110'],2,
  '54 = 32 + 16 + 4 + 2 = 00110110. A positive number is the same in two’s complement.');
q(5,4,'Adders','Assume that two bits A and B are given to a half adder. Which of the following statements is correct with respect to the output of the half adder?',
  ['It always produces 00 as the output.','Output becomes 0 when both A and B are set to 1.','When A is 1 and B is 0, it gives 0 as the output.','When the values of A and B are set to 0 it produces 10₂ as the output.','When the values of A and B are set to 1 it produces 10₂ as the output.'],5,
  'A half adder gives carry = A·B and sum = A ⊕ B. For 1 + 1, carry 1 and sum 0: the output is 10₂.',F);
q(8,5,'OS functions','Consider the following statements about operating systems:\nA – An operating system is a program.\nB – An operating system is loaded to the main memory during the booting process.\nC – In desktop computers operating systems are stored in ROM.\nWhich of the above is/are correct?',
  ABC,4,
  'The OS is a (system) program, and booting loads it from the disk into main memory. On desktops it is stored on the disk, not in ROM — ROM holds the BIOS.',F);
q(9,5,'OS functions','Consider the following functions:\nA – Loading a program from the secondary storage to the main memory.\nB – Managing the hard disk space.\nC – Finding the number of characters in a text file.\nWhich of the above is/are the main function(s) of an operating system?',
  ABC,4,
  'Loading programs (process/memory management) and managing disk space (file management) are OS functions. Counting characters is a job for an application.',F);
q(10,7,'Deployment','Which of the following is correct regarding system deployment?',
  ['User training is part of system deployment.','Integration testing is done in system deployment.','It is a process of testing the system at the developer’s location.','Unit testing is one of the main activities in system deployment.','It is the act of copying ONLY the software developed from the developer’s location to the client’s location.'],1,
  'Deployment installs the system at the client’s site, converts data and trains users. Unit and integration testing happen earlier, at the developer’s side.');
q(11,7,'Testing','Which of the following characteristics of a good test case binds system requirements to a test case?',
  ['Accuracy','Economy','Traceability','Repeatability','Reusability'],3,
  'Traceability links each test case back to the requirement it checks.');
q(12,7,'DFD','Consider the following:\nA – System boundary\nB – External entities\nC – Major information flows between the entities and the system\nD – Flow of data between external entities and the processes\nWhich of the above are components of a context diagram?',
  ['A and B only','B and D only','A, B and C only','B, C and D only','All A, B, C and D'],3,
  'A context diagram shows the whole system as one process inside its boundary, the external entities and the main data flows. Individual processes appear only in level-0 and lower DFDs.',F);
q(13,7,'Requirements','Which of the following is correct with respect to non-functional requirements of a system?',
  ['They define what a system is supposed to do.','They define how a system is supposed to be.','They are specific behaviours of a system.','They represent system functions.','They are usually in the form of "system shall do <requirement>".'],2,
  'Non-functional requirements describe qualities — how the system should be (speed, security, usability). The other options describe functional requirements.');
q(14,7,'Feasibility','Economic feasibility of a system ……………',
  ['involves cost/benefit analysis.','evaluates hardware and software.','determines whether the organisation’s needs can be met by implementing the proposed system.','estimates the time required for the completion of the project.','determines the technical resources required for the project.'],1,
  'Economic feasibility weighs the costs against the benefits. Hardware/software and technical resources are technical feasibility; time is schedule feasibility.');
q(15,10,'Web concepts','Which of the following is correct with respect to a web portal?',
  ['A web portal is a specially designed email server.','Search engines are web portals.','It is a specially designed web site that brings information from diverse sources.','It is a hardware device which is used to get an internet connection.','A web portal is a single web page.'],3,
  'A portal is a web site that gathers information from many sources in one place (for example a news or government portal).');
q(16,10,'Web concepts','Which of the following is an essential item of the World Wide Web (WWW)?',
  ['Email server','Styles','Uniform Resource Locator (URL)','Search engine','Database server'],3,
  'Every web resource is found by its URL. Email servers, styles, search engines and databases are optional.');
q(17,10,'CSS','Which of the following statements could be used to change the style of a paragraph in a document?',
  ['<p style="color: red; font-style: italic">','<p style={color: red; font-style: italic" }>','<style> p {color: red; font-style: italic; } </ style>','<style> p "{color: red; font-style: italic; }" >','<p style= color: red; font-style: italic >'],1,
  'An inline style is written as style="property: value; …" inside the opening tag.',F);
q(18,9,'Flowcharts','Consider the following statements about flowcharts:\nA – Flowcharts can be used to communicate the logic of a solution for a problem with your friends.\nB – Before developing a flowchart, it is required to know the programming language to be used to implement the flowchart.\nC – Every flowchart should have at least one selection symbol.\nWhich of the above statements is/are true?',
  ['A only','B only','C only','A and B only','B and C only'],1,
  'Flowcharts show logic independent of any language, and a simple sequence needs no decision symbol. Only A is true.',F);
q(19,9,'Flowcharts','Consider the flowchart and the following statements:\nA – When n = 0, the output value would be 0.\nB – The algorithm does not produce any output for negative values of n.\nC – When n = 2, the algorithm expects three input values of m.\nWhich of the above statements is/are correct?',
  ['A only','B only','C only','A and B only','B and C only'],1,
  'For n = 0 or any negative n the loop never runs and x = 0 is printed, so A is true and B false. For n = 2 the loop asks for m twice, not three times.',{img:IMG('sbv19-19'),fixed:true,edited:true,chk:true});
q(20,8,'Keys','Which of the following statements is correct with respect to the above relations?',
  ['teacher_id is a part of the primary key in teacher relation','author_id in teacher relation can take NULL value','author_id and book_id in authorOfbook relation can take NULL value','book_id is a candidate key of publisherOfbook relation','author_name in author relation is a candidate key'],2,
  'author_id in teacher is a foreign key and a teacher need not be an author, so it can be NULL. Primary key parts (authorOfbook) can never be NULL.',{ctx:REL});
q(21,8,'SQL','Assume that the above relations are converted into tables in a relational database. The following SQL query is executed on the database:\nSELECT * FROM teacher WHERE author_id IS NOT NULL\nWhich of the following statements is correct regarding the output of the above SQL query?',
  ['It cannot be an empty table.','The tables teacher and author are used to produce the output.','The attribute author_name is in it.','The attribute publisher_name is in it.','All teacher records with a value in the author_id attribute of teacher table are in the output.'],5,
  'The query reads only the teacher table and returns every teacher whose author_id has a value. It can be empty if no teacher is an author.',{ctx:REL});
q(22,8,'SQL constraints','Consider the following statements regarding the Data Definition Language (DDL) used to create the table publisherOfbook while maintaining data integrity.\nA – It has a foreign key constraint\nB – It has a primary key constraint\nC – It has a domain constraint\nWhich of the above statement(s) is/are correct?',
  ['A only','A and B only','A and C only','B and C only','All A, B and C'],5,
  'publisherOfbook needs a composite primary key (publisher_id, book_id), foreign keys to publisher and book, and data types for its columns (domain constraints).',{ctx:REL,fixed:true,chk:true});
q(23,8,'ER to tables','Which of the following Entity Relationship (ER) diagrams would generate the above relations?',
  ['Diagram (1)','Diagram (2)','Diagram (3)','Diagram (4)','Diagram (5)'],1,
  'publisherOfbook and authorOfbook are the tables of two many-to-many relationships. A teacher may or may not be an author and an author may or may not be a teacher (0..1 on both sides), which puts a nullable author_id in teacher — diagram (1).',{ctx:REL,img:IMG('sbv19-23'),fixed:true,chk:true});
q(24,8,'Normalization','Consider the following relation:\nStudent (index_no, student_name, date_of_birth, hobbies)\nindex_no is a unique attribute and hobbies is a multivalued attribute with at most 2 values.\nWhich of the following relation(s) represents the above Student relation in first normal form?',
  ['Student(index_no, student_name, date_of_birth, hobby_1)','Student(index_no, student_name, date_of_birth, hobby_1, hobby_2)','Student(index_no, student_name, date_of_birth) and hobby(hobby_1, hobby_2)','Student(index_no, student_name, date_of_birth) and hobby(hobby_id, hobby_1, hobby_2)','Student(index_no, student_name, house_id), hobby(hobby_id, hobby_name) and student_hobby(index_no, hobby_id)'],2,
  'With at most two hobbies, two single-valued columns hobby_1 and hobby_2 make every value atomic, so the relation is in 1NF without losing data. (1) loses a hobby, (3) and (4) lose the link to the student, (5) loses date_of_birth.',{fixed:true,chk:true});
q(25,6,'Subnetting','Suppose you have the IP address 192.16.5.133/29. How many bits are needed to identify the network, and how many to identify the host?',
  ['29 bits and 3 bits','28 bits and 3 bits','30 bits and 2 bits','28 bits and 4 bits','29 bits and 4 bits'],1,
  '/29 means 29 network bits; 32 − 29 = 3 host bits.');
q(26,6,'Addressing','In a communication network, when a message arrives at its destination, in order to deliver it to the correct application program running at the application layer, which of the following addresses must be consulted?',
  ['MAC address','IP address','Port address','DNS address','Application address'],3,
  'The port number identifies the application (process) on the host that should receive the data.');
q(27,6,'Protocols','Which of the following packet fields is updated during normal IP packet forwarding in a router?',
  ['Time To Live (TTL) value','Source IP address','Destination IP address','Source MAC address','Destination address'],1,
  'Every router decreases the TTL by one (and drops the packet at 0). The IP addresses stay the same end to end.',{chk:true});
q(28,6,'TCP','Which of the following statements about a TCP connection is correct?\nA – Reliable data transfer\nB – Connection oriented\nC – Guaranteed delivery',
  ABC,5,
  'TCP sets up a connection first and uses acknowledgements and retransmission, so delivery is reliable and guaranteed.',F);
q(29,6,'Transmission media','Which of the following statements about fibre optic is correct?\nA – The attenuation is extremely low\nB – The bandwidth provided is high\nC – Fibre optic is immune to electromagnetic interference',
  ABC,5,
  'Light in glass fibre loses very little strength, carries very high bandwidth, and is not affected by electrical interference.',F);
q(30,1,'ICT & society','Which of the following is a benefit of ICT for the society?',
  ['Students can access content at any time.','Students can access content from anywhere.','Provide equal educational opportunities for everyone.','Supports collaborative learning.','Allows anyone to publish anything.'],3,
  'Equal opportunity for everyone is a benefit to society as a whole; the others are benefits to individual learners, and publishing anything can be harmful.',{chk:true});
q(31,2,'Computer system','What are the basic components of a computer system?',
  ['Input, Output, Processing unit','Input, Output, Processing unit, Storage, Users','Input, Output, Processing unit, Storage','Keyboard, Monitor, CPU, RAM','Keyboard, Monitor, CPU, RAM, ROM'],3,
  'Every computer system has input, processing, output and storage. Keyboard, monitor etc. are just examples of devices.');
q(32,1,'Big data','Which of the following is correct with respect to big data?',
  ['High volume is one of the features of big data.','Big data is always structured.','Data generated through social media such as Facebook cannot be considered as big data.','A Management Information System (MIS) is always required to collect big data.','Python is not a suitable programming language to manage big data.'],1,
  'Big data is described by volume, velocity and variety. It is often unstructured, social media is a main source, and Python is widely used for it.');
q(33,7,'Requirements','Which of the following is the most widely used requirement gathering method in a system development project?',
  ['Observation','Questionnaire','Interviews','Collecting information from documents','Engaging in real work'],3,
  'Interviews are the most common fact-finding technique — direct, flexible and detailed.');
q(34,7,'SDLC','Consider the following activities:\nA – Determine whether a project is economically, socially, technologically and organisationally feasible.\nB – Find facts and ascertain the end user requirements of the system.\nC – Determine how the end users would operate a system.\nWhich of the above activities are done during the system analysis stage in a systems development project?',
  ['A only','A and B only','A and C only','B and C only','All A, B and C'],4,
  'Analysis gathers facts and requirements and studies how users will work with the system. Feasibility (A) is decided in the earlier feasibility study.',{fixed:true,chk:true});
q(35,12,'E-commerce','Which of the following statements is true?',
  ['YouTube is a content provider in a B2C service.','Google.com is an example of a web portal in a B2C service.','ebay.com is an example of a C2B service.','The e-banking service is an information broker under B2C service.','doenets.lk is an example of a B2G service.'],1,
  'YouTube provides content to consumers (B2C content provider). eBay is C2C, and doenets.lk (Department of Examinations) is G2C.',{chk:true});
q(36,13,'Artificial intelligence','Consider the following statements regarding Expert Systems in Artificial Intelligence:\nA – An Expert System is a Decision Support System.\nB – In an Expert System the reasons for an answer can be derived.\nC – An online medical support system is an example of an Expert System.\nD – An Expert System has an Inference Engine which updates its knowledge base.\nWhich of the above statements is/are correct?',
  ['A and D only','B and C only','A, B and C only','A, B and D only','A, C and D only'],3,
  'An expert system supports decisions, explains how it reached an answer, and medical diagnosis is a classic example. The inference engine applies the rules — it does not update the knowledge base.',{fixed:true,chk:true});
q(38,6,'Topologies','Which of the following network topologies is most appropriate for a local area network (LAN) that connects the computers by using only one hub?',
  ['Bus','Mesh','Tree','Star','Ring'],4,
  'Every computer connected to one central hub is a star topology.');
q(39,10,'CSS','Consider the following statements about CSS:\nA – Controls the action of a web page\nB – Acronym for Cascading Style Sheet\nC – Acronym for Computer System Software\nD – Used to set the appearance of the web page\nWhich of the above statements are most accurate?',
  ['A and D','B and D','A, B and C','A, B and D','B, C and D'],2,
  'CSS stands for Cascading Style Sheets and sets how a page looks. Behaviour (action) is done with JavaScript. (Option 2 in the original paper was printed as “B” only.)',{fixed:true,edited:true});
q(40,10,'Web concepts','Select the incorrect statement about a blog.',
  ['It has links to other blogs and consists of text, pictures etc.','It is not used for business purposes.','It can be used to communicate ideas between each other.','Free blog publishing tools are available on the web.','It is similar to a personal diary.'],2,
  'Blogs are widely used by businesses for marketing and customer contact, so (2) is incorrect.');
q(41,7,'Systems concepts','Consider the following features about a closed system:\nA – It obtains information by associating with different systems.\nB – It stands alone within a definite limited area.\nC – It considers the relationships with external variables as not important.\nD – It has opinions and objectives limited to the system.\nE – It is a permeable system.\nWhich of the above could be the basic characteristics of a closed system?',
  ['A, B and C','A, B and E','B, C and D','B, C and E','C, D and E'],3,
  'A closed system does not interact with its environment: it stands alone, ignores outside variables and has its own objectives. A and E describe open systems.',F);
q(42,7,'Systems concepts','Consider the following statements about the Kansei systems methodology.\nA – Controls attributes abstractly or sensitively.\nB – It is connected with the trends of computer designing of the modern world.\nC – It affects industrialisation unfavourably.\nWhich of the above is/are true?',
  ['A only','B only','C only','A and B only','B and C only'],4,
  'Kansei engineering turns users’ feelings into design attributes and is used in modern product and interface design. It does not harm industrialisation.',{fixed:true,chk:true});
q(43,9,'Python selection','What is the output of the following Python program?',
  ['4','6','10','14','40'],2,
  'j < y is False but j != 4 is True, so the if branch runs: j = 10 − 4 = 6 and 6 is printed. (The original was written in Python 2 and listed 10 twice.)',
  {code:'j = 10\ny = 4\nif j < y or j != 4:\n    j -= y\n    print(j)\nelse:\n    y *= j\n    print(y)',edited:true});
q(44,7,'SDLC models','A person who decided to extend his business wishes to purchase an appropriate land for it. Accordingly he studies how far the environment, the people who live there and the individual needs are suitable for his business. With which stage of the waterfall model of system development does this study best fit?',
  ['Need identification','Need analysis','System designing','System development','System testing'],2,
  'Studying whether the environment and people suit the needs is analysing the requirements before any design starts.',{chk:true});
q(45,9,'Python data structures','Assume that the following Python statement is executed:\nD = {1:\'76\', 2:\'77\', 3:\'78\'}\nWhich of the following statements would generate an error?',
  ['A = D[2]','D[1] = [1,2,3]','A = D[\'1\']','A = D.keys()','A = D.values()'],3,
  'The keys are the integers 1, 2, 3. The string \'1\' is not a key, so D[\'1\'] raises a KeyError.');
q(46,9,'Python data types','Consider the following Python statements:\nA – a, b = (2, [3,4])\nB – a = 2, 3, 4\nC – a = b, c = (1, [2,3])\nWhich of the above statements is/are valid?',
  ABC,5,
  'A unpacks a 2-tuple, B makes a = (2, 3, 4), and C is a chained assignment: a gets the tuple and b, c unpack it. All are valid.',F);
q(47,9,'Python strings','What is the output of the following Python statement?\nprint("%s - %s" % (1, [2,3]))',
  ['1,2,3','1,[2,3]','1 - [2, 3]','1 - 2,3','1 - 2 - 3'],3,
  'Each %s is replaced by str() of the value: "1" and "[2, 3]".',F);
q(48,9,'Python files','Which of the following Python programs writes data correctly into a file named “output.txt”?',
  ['f = open("output.txt", "r")\nprint(1,2,3, file=f)','f = open("output.txt", "w")\nprint(1,2,3, file=f)','f = open("output.txt", "r")\nprint(1,2,3, file=f)\nclose(f)','f = open("output.txt", "w")\nprint(1,2,3, file=f)\nclose(f)','f = open("output.txt", "w")\nprint(1,2,3, f)\nclose(f)'],2,
  'The file must be opened in "w" mode and print needs file=f. close(f) is not a built-in function (it is f.close()), so (4) and (5) fail; Python closes the file when the program ends.',F);
q(49,9,'Python loops','What would be the output of the following Python program when it is executed?',
  ['12345678910','123456789','246810','108642','8642'],5,
  'range(1, 10) stops at 9. The even values 2, 4, 6, 8 are each put in front of x, giving "8642". (The original had = instead of == in the if.)',
  {code:'x = ""\nfor i in range(1, 10):\n    if i % 2 == 0:\n        x = str(i) + x\nprint(x)',edited:true});
q(50,9,'Python functions','Consider the following Python function. Which of the following statements is correct regarding it?',
  ['The function call f1(20,30) returns the value 20.','The function call f1(y=20, x=10) would generate an error.','The function call f1(20) would generate an error.','The function call f1() would generate an error.','The function call f1(y = 40) would return the value 40.'],5,
  'f1 returns the larger of x and y, both with defaults. f1(y=40) uses x = 0 and returns 40. f1(20,30) returns 30, and keyword or missing arguments are fine.',
  {code:'def f1(x=0, y=30):\n    if x > y:\n        return x\n    else:\n        return y'});
})();
