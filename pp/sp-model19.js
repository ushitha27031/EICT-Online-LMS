/* Department of Examinations — A/L ICT model paper for 2019 and after (new syllabus), Paper I, English medium
   (Knowledge Bank print). Most of its 50 MCQs were reused word for word by Sirimavo Bandaranaike Vidyalaya in
   2019 and are already in sp-sbv19.js; only the 10 that differ are here. Q8 (unclear) and Q9 (no true option)
   are left out. There is no marking scheme: the answers were worked out by EICT, and the ones marked chk are
   worth a second look. Format: see pp-si-2022.js (src/sch name the school paper). */
(function(){
const P=window.EICT_PP=window.EICT_PP||{si:[],en:[]};P.en=P.en||[];
const K='model19', S='Dept. of Examinations · 2019 model paper', Y=2019;
const q=(n,u,t,text,opts,ans,why,x)=>P.en.push(Object.assign({id:'en-'+K+'-'+String(n).padStart(2,'0'),y:Y,n,u,t,src:S,sch:K,text,opts,ans,why},x||{}));
const F={fixed:true};
const PHP='<!DOCTYPE html>\n<html lang="en">\n<head><title>Record Data</title></head>\n<body>\n<form action="index.php" method="POST">\n  Index number:<br>\n  <input type="text" name="index"><br>\n  Name:<br>\n  <input type="text" name="name"><br>\n  <input type="submit" name="submit" value="Submit">\n</form>\n<?php\nif (isset($_POST[\'submit\'])) {\n  $conn = new mysqli(\'localhost\', \'root\', \'root@1234\', \'school\');\n  if ($conn->connect_error) {\n    die("Connection failed: " . $conn->connect_error);\n  }\n  $sql = "insert into student(id,name) values(\'".$_POST[\'index\']."\',\'".$_POST[\'name\']."\');";\n  if ($conn->query($sql) === TRUE) {\n    echo "New record inserted successfully";\n  } else {\n    echo "Error: " . $sql . "<br>" . $conn->error;\n  }\n  $conn->close();\n}\n?>\n</body>\n</html>';

q(3,3,'Number representation','What is the two’s complement representation of the decimal 86, if an integer is represented by 8 bits?',
  ['01010110','01110110','01010010','00010110','01001110'],1,
  '86 = 64 + 16 + 4 + 2 = 01010110. A positive number is written the same in two’s complement.');
q(4,3,'Number representation','Which of the following decimal numbers is equivalent to the two’s complement binary number 11000110?',
  ['−85','−58','−56','−78','−68'],2,
  'The leading 1 means negative. Invert and add 1: 00111001 + 1 = 00111010 = 58, so −58.');
q(5,3,'Number systems','7E₁₆ + 101101₂ is equal to',
  ['011101011₂','175₁₀','AA₁₆','173₁₀','AB₁₆'],5,
  '7E₁₆ = 126 and 101101₂ = 45. 126 + 45 = 171 = AB₁₆.');
q(6,4,'Logic gates','Consider the truth table. Which of the following correctly gives the truth values of P, Q, R and S, in that order, for NOT A AND ((A AND B) OR (A XOR B))?',
  ['1, 0, 0, 0','1, 1, 0, 0','1, 0, 0, 1','0, 0, 1, 0','0, 1, 0, 0'],5,
  '(A AND B) OR (A XOR B) is 0, 1, 1, 1 for the four rows (it is A OR B). ANDing with NOT A (1, 1, 0, 0) gives 0, 1, 0, 0.',
  {code:'A B | A AND B | A XOR B | NOT A | NOT A AND ((A AND B) OR (A XOR B))\n0 0 |    0    |    0    |   1   | P\n0 1 |    0    |    1    |   1   | Q\n1 0 |    0    |    1    |   0   | R\n1 1 |    1    |    0    |   0   | S',fixed:true});
q(12,7,'COTS','Which of the following is correct with respect to off-the-shelf software?',
  ['They always satisfy all user requirements.','Their prices are always very high.','The cost for the development of an off-the-shelf product is effectively split across numerous buyers.','They are designed for individual clients’ requirements.','The risk of failure is very high.'],3,
  'An off-the-shelf package is made once and sold to many buyers, so each pays only a share of the development cost. It is generic, so it may not meet every need.');
q(15,7,'User interface','Consider the following components:\nA – Input controls\nB – Navigational components\nC – Informational components\nD – Containers\nWhich of the above are components of a user interface?',
  ['A and B only','B and D only','A, B and C only','B, C and D only','All A, B, C and D'],5,
  'User interface elements are grouped into input controls (buttons, text fields), navigational components (menus, links), informational components (messages, progress bars) and containers (panels, accordions).',F);
q(21,10,'CSS','Which of the following CSS rules can be used to change the colour of a link to green when clicked?',
  ['a:link {color: green}','a.link {color: green}','a:visited {color: green}','a.visited {color: green}','a {color: green}'],3,
  'Pseudo-classes use a colon. After a link has been clicked it is a visited link, styled with a:visited. (a.link and a.visited are class selectors.)',{chk:true});
q(23,10,'PHP & MySQL','Assume that the name of the following script is index.php. Which of the following will happen when this script is rendered?',
  ['There would be only one input box and a button with the label "submit" on the screen.','There would be only two input boxes on the screen.','There would be only two input boxes and a button with the label "submit" on the screen.','There would be only a button with the label "submit" on the screen.','There would be some text, two input boxes and a button on the screen.'],5,
  'The form shows the text "Index number:" and "Name:", two text boxes and a Submit button. The PHP part runs only after the form is submitted.',{code:PHP});
q(24,10,'PHP & MySQL','Using the same index.php script, which of the following would happen when a user clicks the button on the screen?',
  ['The form data is displayed on the screen.','A script named "index.html" is executed.','A database connection to a database named "localhost" is created.','A new record is inserted into a database.','The message "New record inserted successfully" may be displayed.'],5,
  'The form posts back to index.php, which connects to the database "school" on localhost and tries to insert the record. If the insert succeeds the message is shown; it can also fail, so “may be displayed” is the correct choice.',{code:PHP,chk:true});
q(37,11,'IoT','Which of the following statements is correct with respect to IoT?',
  ['A device with or without a switch with on and off can be used in an IoT application.','In an IoT application, only connected devices are available.','In IoT, devices talk to each other.','All IoT applications are highly secured systems.','Privacy is always protected in IoT systems.'],3,
  'The Internet of Things connects everyday devices so that they communicate with each other over the network. IoT systems are not automatically secure or private.',{chk:true});
})();
