/* Department of Education, Southern Province — Grade 13 Third Term Practice Test, December 2022. ICT Paper I.
   Sinhala and English medium (the same paper, so each question is in both). 46 of its 50 MCQs:
   Q9 and Q11 have no correct option, Q29's tables do not match any normal form, and Q50 is unclear — left out.
   There is no marking scheme: the answers were worked out by EICT, and the ones marked chk are worth a second look.
   Format: see pp-si-2022.js (src/sch name the school paper). */
(function(){
const P=window.EICT_PP=window.EICT_PP||{si:[],en:[]};P.si=P.si||[];P.en=P.en||[];
const K='sp22', Y=2022, SRC={en:'Southern Province · G13 Term 3 · 2022',si:'දකුණු පළාත · 13 ශ්‍රේණිය 3 වාරය · 2022'};
/* q(n, lesson, topic, answer, english, sinhala, extra) — english/sinhala are [text, options, why] */
const q=(n,u,t,ans,en,si,x)=>{const id=String(n).padStart(2,'0');
  P.en.push(Object.assign({id:'en-'+K+'-'+id,y:Y,n,u,t,src:SRC.en,sch:K,text:en[0],opts:en[1],ans,why:en[2]},x||{}));
  P.si.push(Object.assign({id:'si-'+K+'-'+id,y:Y,n,u,t,src:SRC.si,sch:K,text:si[0],opts:si[1],ans,why:si[2]},x||{}));};
const IMG=f=>'pp/en/'+f+'.png';
const F={fixed:true};
const ABC_E=['A only','A and B only','A and C only','B and C only','All A, B and C'];
const ABC_S=['A පමණි','A සහ B පමණි','A සහ C පමණි','B සහ C පමණි','A, B, C සියල්ල'];

q(1,2,'Computer history',4,
 ['Which was the first digital computer designed to use the stored-program concept?',['IBM 701','MARK I','ENIAC','EDVAC','Abacus'],
  'EDVAC (von Neumann’s design) was the first computer designed to keep its program in memory. ENIAC was programmed by rewiring.'],
 ['මිනිසා විසින් නිර්මාණය කොට ගබඩා කළ ක්‍රමලේඛ සංකල්පය යොදා ගත් ප්‍රථම අංකිත පරිගණකය වන්නේ,',['IBM 701','MARK I','ENIAC','EDVAC','Abacus'],
  'ක්‍රමලේඛය මතකයේ ගබඩා කර තබා ගැනීමට (von Neumann සැලසුම) නිර්මාණය කළ පළමු පරිගණකය EDVAC ය. ENIAC ක්‍රමලේඛනය කළේ රැහැන් නැවත සම්බන්ධ කිරීමෙනි.'],{chk:true});
q(2,2,'Memory hierarchy',1,
 ['Storage devices differ in capacity and access speed. Which answer lists them so that the capacity gradually increases and the access speed gradually decreases?',
  ['Registers – L1 cache – L2 cache – Main memory – Hard disk','Registers – L2 cache – L1 cache – Main memory – Hard disk','Hard disk – Main memory – L2 cache – L1 cache – Registers','Main memory – Registers – Hard disk – L1 cache – L2 cache','L1 cache – L2 cache – Registers – Main memory – Hard disk'],
  'Going down the memory hierarchy each level is bigger and slower: registers → L1 → L2 → main memory → hard disk.'],
 ['ධාරිතාව හා ප්‍රවේශ වේගය අනුව ආචයන උපාංග එකිනෙකට වෙනස් වේ. ධාරිතාව ක්‍රමයෙන් වැඩි වෙමින් ප්‍රවේශ වේගය ක්‍රමයෙන් අඩු වන පිළිවෙළට ආචයන උපාංග සකසා ඇති පිළිතුර වනුයේ,',
  ['රෙජිස්තර – L1 නිහිත මතකය – L2 නිහිත මතකය – ප්‍රධාන මතකය – දෘඪ තැටිය','රෙජිස්තර – L2 නිහිත මතකය – L1 නිහිත මතකය – ප්‍රධාන මතකය – දෘඪ තැටිය','දෘඪ තැටිය – ප්‍රධාන මතකය – L2 නිහිත මතකය – L1 නිහිත මතකය – රෙජිස්තර','ප්‍රධාන මතකය – රෙජිස්තර – දෘඪ තැටිය – L1 නිහිත මතකය – L2 නිහිත මතකය','L1 නිහිත මතකය – L2 නිහිත මතකය – රෙජිස්තර – ප්‍රධාන මතකය – දෘඪ තැටිය'],
  'මතක ධුරාවලියේ පහළට යන විට එක් එක් මට්ටම විශාල වන අතර මන්දගාමී වේ: රෙජිස්තර → L1 → L2 → ප්‍රධාන මතකය → දෘඪ තැටිය.'],F);
q(3,2,'CPU',1,
 ['Considering the operation of the fetch–execute cycle, the relevant instruction is executed in the',['Arithmetic and Logic Unit (ALU)','Memory address register','Memory buffer register','Program counter','Current instruction register'],
  'The instruction is carried out by the ALU (under the control unit). The registers only hold addresses, data and the instruction.'],
 ['ආහරණ–ක්‍රියාකරවීම් චක්‍රයේ (fetch–execute cycle) ක්‍රියාකාරිත්වය සැලකීමේ දී අදාළ උපදෙස ක්‍රියාත්මක කිරීම සිදු වන්නේ,',['අංක ගණිත හා තාර්කික ඒකකය (ALU) තුළ ය','Memory address රෙජිස්තරය තුළ ය','Memory buffer රෙජිස්තරය තුළ ය','වැඩසටහන් ගණකය (Program counter) තුළ ය','Current instruction රෙජිස්තරය තුළ ය'],
  'උපදෙස ක්‍රියාත්මක කරන්නේ ALU මගිනි (පාලන ඒකකයේ පාලනය යටතේ). රෙජිස්තර ලිපින, දත්ත හා උපදෙස රඳවා තබා ගනී.']);
q(4,3,'Number representation',2,
 ['Which answer represents 48₁₀ in 8-bit two’s complement?',['11001111₂','00110000₂','00100010₂','01000010₂','10111101₂'],
  '48 = 32 + 16 = 00110000₂. A positive number is written the same in two’s complement.'],
 ['බිටු අට භාවිතයෙන් 48₁₀ හි දෙකේ අනුපූරක ද්වීමය නිරූපණය කුමක් ද?',['11001111₂','00110000₂','00100010₂','01000010₂','10111101₂'],
  '48 = 32 + 16 = 00110000₂. ධන සංඛ්‍යාවක් දෙකේ අනුපූරකයේ ද එලෙසම ලියයි.'],F);
q(5,3,'Number systems',2,
 ['Consider the following three numbers in binary, octal and hexadecimal respectively:\nA – 1000110001₂\nB – 451₈\nC – 131₁₆\nWhich of the above is equivalent to 305₁₀?',['A only','C only','B and C only','A and C only','All A, B and C'],
  '1000110001₂ = 512 + 32 + 16 + 1 = 561. 451₈ = 256 + 40 + 1 = 297. 131₁₆ = 256 + 48 + 1 = 305. Only C.'],
 ['පිළිවෙළින් ද්වීමය, අෂ්ටක හා ෂඩ් දශමය ආකාරයෙන් ඇති සංඛ්‍යා තුන සලකන්න.\nA – 1000110001₂\nB – 451₈\nC – 131₁₆\nඉහත කවරක් දශමය 305 ට තුල්‍ය වේ ද?',['A පමණි','C පමණි','B හා C පමණි','A හා C පමණි','A, B, C සියල්ල'],
  '1000110001₂ = 512 + 32 + 16 + 1 = 561. 451₈ = 256 + 40 + 1 = 297. 131₁₆ = 256 + 48 + 1 = 305. C පමණි.'],F);
q(6,3,'Number systems',3,
 ['The decimal equivalent of binary 10011.11₂ is',['19.00₁₀','19.25₁₀','19.75₁₀','19.50₁₀','18.75₁₀'],
  '10011₂ = 19 and .11₂ = 0.5 + 0.25 = 0.75, so 19.75.'],
 ['ද්වීමය 10011.11₂ ට තුල්‍ය දශම සංඛ්‍යාව වනුයේ,',['19.00₁₀','19.25₁₀','19.75₁₀','19.50₁₀','18.75₁₀'],
  '10011₂ = 19 සහ .11₂ = 0.5 + 0.25 = 0.75. එබැවින් 19.75.']);
q(7,3,'Bitwise operations',1,
 ['What is the result of the bitwise operation 1010010₂ XOR 1110001₂?',['00100011₂','00001010₂','10001110₂','10000000₂','00001111₂'],
  'XOR gives 1 where the bits differ: 1010010 ⊕ 1110001 = 0100011 → 00100011₂ in 8 bits.'],
 ['1010010₂ සහ 1110001₂ යන ද්වීමය සංඛ්‍යා දෙකෙහි බිටු අනුසාරී XOR මෙහෙයුමේ නිවැරදි ප්‍රතිඵලය වනුයේ,',['00100011₂','00001010₂','10001110₂','10000000₂','00001111₂'],
  'බිටු වෙනස් වන තැන්වල XOR 1 දෙයි: 1010010 ⊕ 1110001 = 0100011 → බිටු 8 කින් 00100011₂.']);
q(8,4,'Boolean algebra',1,
 ['Consider the Boolean expression XYZ̄ + XY. Which of the following is equal to it?',['XY','XYZ','XYZ̄','X','Y'],
  'Absorption: XYZ̄ + XY = XY(Z̄ + 1) = XY.'],
 ['XYZ̄ + XY යන බූලියානු ප්‍රකාශනය සලකන්න. පහත ඒවායින් කවරක් ඊට තුල්‍ය වේ ද?',['XY','XYZ','XYZ̄','X','Y'],
  'අවශෝෂණ නියමය: XYZ̄ + XY = XY(Z̄ + 1) = XY.']);
q(10,4,'Karnaugh maps',1,
 ['Consider the following K-map. What is the simplified expression?',['BC̄','ĀB + C̄D','ĀB̄ + C̄D̄','ĀB̄','C̄D̄'],
  'The four 1s are in columns AB = 01 and 11 (B = 1) and rows CD = 00 and 01 (C = 0). One group of four gives BC̄.'],
 ['පහත කානෝ සිතියම සලකන්න. එය සුළු කිරීමෙන් ලැබෙන ප්‍රකාශනය කුමක් ද?',['BC̄','ĀB + C̄D','ĀB̄ + C̄D̄','ĀB̄','C̄D̄'],
  '1 හතර ඇත්තේ AB = 01 හා 11 තීරුවල (B = 1) සහ CD = 00 හා 01 පේළිවල (C = 0) ය. හතරේ එක් කණ්ඩායමකින් BC̄ ලැබේ.'],
 {code:'        AB=00  AB=01  AB=11  AB=10\nCD=00     0      1      1      0\nCD=01     0      1      1      0\nCD=11     0      0      0      0\nCD=10     0      0      0      0',fixed:true});
q(12,5,'Process states',5,
 ['In the seven-state process transition diagram, which can be a reason for a process to change from the running state to the blocked state?',['The time allocated by the processor for the process expires','The processor has to be given to a higher priority process','A system call interrupts the process','The main/parent process of the running process has finished','An input or output request (I/O request) occurs'],
  'A running process is blocked when it has to wait for an event such as I/O. A time-out or a higher-priority process sends it back to ready, not blocked.'],
 ['සත් ක්‍රියායන සංක්‍රාන්ති සටහනට (Seven State Process Transition) අදාළව, ධාවන තත්ත්වයේ පවතින ක්‍රියායනයක් අවහිර (Blocked) තත්ත්වයට මාරු වීමට හේතුවක් විය හැක්කේ,',['ක්‍රියායනය සඳහා සකසනයෙන් වෙන් කළ කාලය අවසන් වීම','ප්‍රමුඛතාව වැඩි ක්‍රියායනයක් සඳහා සකසනය ලබා දිය යුතු වීම','පද්ධති ඇමතුමක් (System Call) හේතුවෙන් ක්‍රියායනයට බාධාවක් ඇති වීම','ධාවනය වන ක්‍රියායනයේ ප්‍රධාන/මව් ක්‍රියායනය අවසන් වීම','ආදාන හෝ ප්‍රතිදාන ඉල්ලීමක් (I/O Request) ඇති වීම'],
  'සිදුවීමක් (උදා: I/O) සඳහා රැඳී සිටිය යුතු වූ විට ධාවන ක්‍රියායනය අවහිර වේ. කාලය අවසන් වීම හෝ ප්‍රමුඛ ක්‍රියායනයක් නිසා එය සූදානම් (ready) තත්ත්වයට යයි.']);
q(13,5,'File systems',4,
 ['Which is the correct statement regarding file systems?',['The overall structure involved in naming, storing and organising files is called the file directory.','FAT and NTFS are two different file formats.','NTFS keeps two copies of a given file for security.','exFAT is a file system owned by Microsoft that is suitable for external storage devices.','The FAT file system is compatible with Unicode.'],
  'exFAT was made by Microsoft for flash drives and memory cards. The overall structure is the file system (not the directory), and FAT/NTFS are file systems, not file formats.'],
 ['ගොනු පද්ධති සම්බන්ධයෙන් නිවැරදි වගන්තිය කුමක් ද?',['ගොනු නම් කිරීම, ගබඩා කිරීම සහ සංවිධානය කිරීම සම්බන්ධ සමස්ත ව්‍යුහය ගොනු නාමාවලිය නම් වේ.','FAT සහ NTFS යනු ගොනු ප්‍රරූප දෙකකි.','ආරක්ෂාව සඳහා ගොනුවක පිටපත් දෙකක් පවත්වා ගැනීම NTFS හි විශේෂ ලක්ෂණයකි.','exFAT යනු Microsoft සමාගමට හිමි, බාහිර ආචයන උපාංග සඳහා යෝග්‍ය ගොනු පද්ධතියකි.','FAT ගොනු පද්ධතිය යුනිකේත සමග අනුරූප වේ.'],
  'exFAT යනු පෙන් ඩ්‍රයිව්, මතක කාඩ් සඳහා Microsoft නිපදවූ ගොනු පද්ධතියකි. සමස්ත ව්‍යුහය ගොනු පද්ධතිය මිස නාමාවලිය නොවේ; FAT/NTFS ගොනු පද්ධති මිස ප්‍රරූප නොවේ.'],{chk:true});
q(14,5,'Process management',5,
 ['Which information in the Process Control Block (PCB) is needed to continue executing a process from where it stopped?',['Process ID','Memory management information','Pointer','Process status','Program counter'],
  'The program counter holds the address of the next instruction, so the process can resume exactly where it left off.'],
 ['ක්‍රියායනයක් එහි පෙර තිබූ තත්ත්වයේ සිට ඉදිරියට ක්‍රියාත්මක කිරීම සඳහා අදාළ වන, ක්‍රියායන පාලන ඛණ්ඩයේ (PCB) ඇති තොරතුර කුමක් ද?',['ක්‍රියායන හැඳුනුම (Process ID)','මතක කළමනාකරණ තොරතුරු','දර්ශකය (Pointer)','ක්‍රියායන තත්ත්වය','වැඩසටහන් ගණකය (Program counter)'],
  'ඊළඟ උපදෙසේ ලිපිනය වැඩසටහන් ගණකයේ ඇති බැවින්, ක්‍රියායනය නැවතුණු තැනින්ම නැවත ආරම්භ කළ හැකි ය.'],{chk:true});
q(15,5,'Virtual memory',5,
 ['The ………… address of virtual memory corresponding to a ………… address of physical memory is calculated by ………… . What are the suitable words for the blanks?',['Private, Common, Processor','Memory Management Unit, Logical, Physical','Logical, Physical, Memory registers','Logical, Physical, Registers','Logical, Physical, Memory Management Unit'],
  'The MMU maps each logical (virtual) address to a physical address in main memory.'],
 ['අතථ්‍ය මතකයේ (Virtual memory) ………… යොමුවකට අනුරූප වන ප්‍රධාන මතකයේ (Physical memory) ………… යොමුව ගණනය කරනුයේ ………… මගිනි. හිස්තැන්වලට ගැළපෙන පද ඇති වරණය තෝරන්න.',['පෞද්ගලික, පොදු, සකසනය','මතක කළමනාකරණ ඒකකය, තාර්කික, භෞතික','තාර්කික, භෞතික, මතක රෙජිස්තර','තාර්කික, භෞතික, රෙජිස්තර','තාර්කික, භෞතික, මතක කළමනාකරණ ඒකකය'],
  'එක් එක් තාර්කික (අතථ්‍ය) ලිපිනය ප්‍රධාන මතකයේ භෞතික ලිපිනයකට සිතියම් කරන්නේ MMU මගිනි.'],F);
q(16,6,'Signals',5,
 ['Consider the following statements regarding signals.\nA – Information can be transmitted using a high-frequency carrier signal.\nB – A digital signal represents a form of discrete values.\nC – A broadband signal operates as an analog signal.\nWhich of the above statement/s is/are correct?',ABC_E,
  'Modulation puts information on a high-frequency carrier, digital signals take discrete values, and broadband transmission uses analog signals on many frequencies.'],
 ['සංඥා පිළිබඳ පහත ප්‍රකාශ සලකන්න.\nA – අධි සංඛ්‍යාත වාහක සංඥාවක් මගින් තොරතුරු සම්ප්‍රේෂණය කළ හැකි ය.\nB – අංකිත සංඥාවක් විවික්ත අගයන්ගෙන් (discrete values) යුත් ස්වරූපයක් නිරූපණය කරයි.\nC – පුළුල් කලාප සංඥාවක් (broadband signal) ප්‍රතිසම සංඥාවක් ලෙස ක්‍රියාත්මක වේ.\nඉහත ප්‍රකාශ අතුරින් නිවැරදි ඒවා කවරේ ද?',ABC_S,
  'මූර්ජනයෙන් තොරතුරු අධි සංඛ්‍යාත වාහකයක් මත යවයි; අංකිත සංඥාවලට ඇත්තේ විවික්ත අගයන් ය; පුළුල් කලාප සම්ප්‍රේෂණය සංඛ්‍යාත රැසක ප්‍රතිසම සංඥා භාවිත කරයි.'],{fixed:true,chk:true});
q(17,6,'Addressing',2,
 ['Consider the following statements regarding the IP address 130.210.16.0\nA – It is a class A IP address.\nB – Its subnet mask is 255.255.0.0\nC – 254 host addresses can be created.\nWhich of the above statement/s is/are correct?',['A only','B only','A and C only','B and C only','All A, B and C'],
  'The first octet 130 is in 128–191, so it is class B with the default mask 255.255.0.0. A class B network has 2¹⁶ − 2 = 65,534 hosts, not 254.'],
 ['130.210.16.0 IP ලිපිනය සම්බන්ධයෙන් පහත ප්‍රකාශ සලකන්න.\nA – එය A පන්තියේ IP ලිපිනයකි.\nB – එහි උපජාල ආවරණය 255.255.0.0 වේ.\nC – සත්කාරක ලිපින 254 ක් නිර්මාණය කළ හැකි ය.\nඉහත ප්‍රකාශ අතුරින් නිවැරදි ඒවා කවරේ ද?',['A පමණි','B පමණි','A සහ C පමණි','B සහ C පමණි','A, B, C සියල්ල'],
  'පළමු අෂ්ටකය 130 ක් වන බැවින් (128–191) එය B පන්තියේ ය; පෙරනිමි ආවරණය 255.255.0.0. B පන්තියේ ජාලයකට සත්කාරක 2¹⁶ − 2 = 65,534 ක් ඇත.'],F);
q(18,6,'Subnetting',3,
 ['Consider the following statements regarding classless IP addressing.\nA – It helps to use a range of IP addresses effectively.\nB – The subnet mask of the IP address 192.168.12.0/27 is 255.255.255.224.\nC – The CIDR notation of an IP address represents the number of host bits contained in the address.\nWhich of the above statement/s is/are correct?',['A only','B only','A and B only','B and C only','All A, B and C'],
  'Classless addressing avoids wasting addresses, and /27 = 255.255.255.224. The number after the slash is the number of network bits, not host bits.'],
 ['පන්ති රහිත IP ලිපින සම්බන්ධයෙන් පහත ප්‍රකාශ සලකන්න.\nA – IP ලිපින පරාසයක් ඵලදායී ලෙස භාවිත කිරීමට උපකාරී වේ.\nB – 192.168.12.0/27 ලිපිනයේ උපජාල ආවරණය 255.255.255.224 වේ.\nC – IP ලිපිනයේ CIDR අංකයෙන් ලිපිනයේ ඇති සත්කාරක බිටු ගණන නිරූපණය වේ.\nඉහත ප්‍රකාශ අතුරින් නිවැරදි ඒවා කවරේ ද?',['A පමණි','B පමණි','A සහ B පමණි','B සහ C පමණි','A, B, C සියල්ල'],
  'පන්ති රහිත ලිපිනකරණයෙන් ලිපින නාස්තිය අඩු වේ; /27 = 255.255.255.224. ඇල ඉරෙන් පසු අංකය ජාල බිටු ගණනයි, සත්කාරක බිටු නොවේ.'],F);
q(19,6,'Subnetting',5,
 ['Four subnets are created using the 192.168.10.0/24 address range. 50 computers are used in each subnet. Select the incorrect statement.',['The new subnet mask of a created subnet should be 255.255.255.192.','192.168.10.64 can be the network address of one subnet.','6 host bits are required to create one of the above subnets.','Two subnet bits are enough to create the subnets.','The subnet mask may be different in each subnet.'],
  '2 subnet bits give 4 subnets of 64 addresses (6 host bits, 62 hosts ≥ 50) with mask /26 = 255.255.255.192: .0, .64, .128, .192. All four use the same mask.'],
 ['192.168.10.0/24 ලිපින පරාසය භාවිතයෙන් උපජාල 4 ක් නිර්මාණය කර ඇත. සෑම උපජාලයකම පරිගණක 50 බැගින් ඇත. පහත ප්‍රකාශ අතුරින් සදොස් වරණය තෝරන්න.',['නිර්මාණය කළ උපජාලයක නව උපජාල ආවරණය 255.255.255.192 විය යුතු ය.','192.168.10.64 එක් උපජාලයක ජාල ලිපිනය විය හැකි ය.','ඉහත උපජාලයක් නිර්මාණය කිරීමට සත්කාරක බිටු 6 ක් අවශ්‍ය වේ.','උපජාල නිර්මාණයට උපජාල බිටු දෙකක් ප්‍රමාණවත් වේ.','එක් එක් උපජාලයේ උපජාල ආවරණය වෙනස් විය හැකි ය.'],
  'උපජාල බිටු 2 කින් ලිපින 64 බැගින් උපජාල 4 ක් ලැබේ (සත්කාරක බිටු 6, සත්කාරක 62 ≥ 50), ආවරණය /26 = 255.255.255.192: .0, .64, .128, .192. හතරේම ආවරණය එකම ය.']);
q(20,6,'Cryptography',2,
 ['Consider the following statements regarding asymmetric key encryption.\nA – The message is encrypted using the recipient’s public key and decrypted using the recipient’s private key.\nB – The private key is secret; if an unauthorised party gets it, the confidentiality of the message is affected.\nC – It ensures that the message has not been changed during communication.\nWhich of the above statement/s is/are correct?',ABC_E,
  'Encrypting with the receiver’s public key means only their private key can decrypt it, so leaking that key breaks confidentiality. Encryption alone does not prove the message was unchanged — that needs a hash or digital signature.'],
 ['අසමමිතික යතුරු ගුප්තකේතනය සම්බන්ධයෙන් පහත ප්‍රකාශ සලකන්න.\nA – ලබන්නාගේ පොදු යතුරෙන් (public key) කේතනය කරන පණිවිඩය ලබන්නාගේ පෞද්ගලික යතුරෙන් (private key) විකේතනය කරයි.\nB – පෞද්ගලික යතුර රහසිගත වන අතර එය අනවසර පුද්ගලයන් අතට පත් වීම පණිවිඩයේ රහස්‍යභාවයට තර්ජනයකි.\nC – සන්නිවේදනය අතරතුර පණිවිඩය වෙනස් වී නොමැති බව තහවුරු වේ.\nඉහත ප්‍රකාශ අතුරින් නිවැරදි ඒවා කවරේ ද?',ABC_S,
  'ලබන්නාගේ පොදු යතුරෙන් කේතනය කළ විට ඔහුගේ පෞද්ගලික යතුරෙන් පමණක් විකේතනය කළ හැකි නිසා එය හෙළි වීම රහස්‍යභාවයට තර්ජනයකි. පණිවිඩය වෙනස් නොවූ බව තහවුරු කිරීමට හැෂ් හෝ ඩිජිටල් අත්සනක් අවශ්‍ය ය.'],{fixed:true,chk:true});
q(21,6,'Network devices',4,
 ['Which is the incorrect statement regarding a proxy server?',['It is essential for forwarding data packets from a computer network that has private IP addresses.','It caches frequently accessed web pages.','It helps to hide the internal network from outside observers.','It automatically assigns IP addresses to host computers.','It is responsible for getting information to a host computer.'],
  'Assigning IP addresses automatically is the job of a DHCP server, not a proxy. A proxy caches pages, hides the internal network and fetches content for clients.'],
 ['නියෝජ්‍ය සේවාදායකයක් (proxy server) සම්බන්ධයෙන් සදොස් වරණය කුමක් ද?',['පෞද්ගලික IP ලිපින සහිත පරිගණක ජාලයකින් බාහිරට දත්ත පැකට්ටු යොමු කිරීමට එය අත්‍යවශ්‍ය වේ.','එය නිතර ප්‍රවේශ වන වෙබ් පිටු නිහිත (cache) කර තබා ගනී.','අභ්‍යන්තර ජාලය බාහිර නිරීක්ෂකයන්ගෙන් සැඟවීමට උපකාරී වේ.','සත්කාරක පරිගණක (host computers) වෙත ස්වයංක්‍රීයව IP ලිපින පවරයි.','සත්කාරක පරිගණකයක් වෙත තොරතුරු ලබා දීමේ වගකීම දරයි.'],
  'IP ලිපින ස්වයංක්‍රීයව පවරන්නේ DHCP සේවාදායකය මිස proxy නොවේ. Proxy එකක් පිටු නිහිත කරයි, අභ්‍යන්තර ජාලය සඟවයි, සේවාලාභීන් වෙනුවෙන් තොරතුරු ලබා ගනී.'],{chk:true});
q(22,6,'Protocols',5,
 ['Assume that the command ping 192.168.10.1 is executed from a computer with the IP address 192.168.10.12.\nA – The source IP is 192.168.10.12 and the destination IP of the data packet is 192.168.10.1.\nB – The Round Trip Time (RTT) can be observed by the ping command.\nC – The lifetime of a data packet (TTL) can be observed by this command.\nWhich of the above statement/s is/are correct?',['A only','B only','A and C only','B and C only','All A, B and C'],
  'The packet goes from 192.168.10.12 to 192.168.10.1, and every ping reply shows the round-trip time and the TTL.'],
 ['192.168.10.12 පරිගණකයේ සිට ping 192.168.10.1 විධානය ක්‍රියාත්මක කළේ යැයි උපකල්පනය කරන්න.\nA – දත්ත පැකට්ටුවේ ප්‍රභව IP ලිපිනය 192.168.10.12 ද ගමනාන්ත IP ලිපිනය 192.168.10.1 ද වේ.\nB – මෙම විධානයෙන් වට චාරිකා කාලය (Round Trip Time – RTT) නිරීක්ෂණය කළ හැකි ය.\nC – මෙම විධානයෙන් දත්ත පැකට්ටුවක ජීවන කාලය (TTL) නිරීක්ෂණය කළ හැකි ය.\nඉහත ප්‍රකාශ අතුරින් නිවැරදි ඒවා කවරේ ද?',['A පමණි','B පමණි','A සහ C පමණි','B සහ C පමණි','A, B, C සියල්ල'],
  'පැකට්ටුව 192.168.10.12 සිට 192.168.10.1 දක්වා යයි; සෑම ping පිළිතුරකම වට චාරිකා කාලය සහ TTL පෙන්වයි.'],F);
q(23,7,'Requirements',3,
 ['Which of the following describes a non-functional requirement of an automated teller machine (ATM) system?',['The system enables the user to withdraw money.','It enables printing a receipt at the end of the transaction.','The screen of the ATM should be touch sensitive.','It allows the user to deposit money.','The system displays the account balance to the user at the end of the transaction.'],
  'A touch-sensitive screen is a quality/constraint of how the system is, not something it does. The others are functions.'],
 ['ස්වයංක්‍රීය ටෙලර් යන්ත්‍ර (ATM) පද්ධතියක ක්‍රියාකාරී නොවන (non-functional) අවශ්‍යතාවක් විස්තර කරන්නේ පහත කවර වගන්තිය ද?',['පද්ධතිය පරිශීලකයාට මුදල් ලබා ගැනීමේ හැකියාව ලබා දීම','ගනුදෙනුව අවසානයේ රිසිට්පතක් මුද්‍රණය කිරීමේ හැකියාව','ATM යන්ත්‍රයේ තිරය ස්පර්ශ සංවේදී විය යුතු ය.','පරිශීලකයාට මුදල් තැන්පත් කිරීමේ හැකියාව ලබා දීම','ගනුදෙනුව අවසානයේ ගිණුමේ ශේෂය පරිශීලකයාට පෙන්වීම'],
  'ස්පර්ශ සංවේදී තිරය පද්ධතිය කරන කාර්යයක් නොව එහි ගුණාංගයකි. අනෙක් ඒවා කාර්යයන් (functional) ය.']);
q(24,7,'Testing',1,
 ['Which of the following tests can be performed using both white box and black box testing methods?\nA – Unit testing\nB – Integration testing\nC – System testing\nD – Acceptance testing',['A and B','C and D','A, B and D','B, C and D','All A, B, C and D'],
  'Unit and integration tests are done by developers who can see the code (white box) or test only inputs/outputs (black box). System and acceptance tests treat the whole system as a black box.'],
 ['ශ්වේත මංජුසා (White box) සහ කළු මංජුසා (Black box) යන පරීක්ෂණ ක්‍රම දෙකෙන්ම කළ හැකි පරීක්ෂණ මොනවා ද?\nA – ඒකක පරීක්ෂාව\nB – ඒකාබද්ධ පරීක්ෂාව\nC – පද්ධති පරීක්ෂාව\nD – ප්‍රතිග්‍රහණ පරීක්ෂාව',['A, B','C, D','A, B, D','B, C, D','A, B, C, D සියල්ල'],
  'ඒකක හා ඒකාබද්ධ පරීක්ෂා කේතය දකින සංවර්ධකයන් විසින් ශ්වේත මංජුසා ලෙස හෝ ආදාන/ප්‍රතිදාන පමණක් බලා කළු මංජුසා ලෙස කළ හැකි ය. පද්ධති හා ප්‍රතිග්‍රහණ පරීක්ෂා මුළු පද්ධතියම කළු මංජුසාවක් ලෙස සලකයි.'],{fixed:true,chk:true});
q(25,7,'DFD',5,
 ['Which shows an incorrect data flow according to data flow modelling in SSADM?',['Diagram (1)','Diagram (2)','Diagram (3)','Diagram (4)','Diagram (5)'],
  'In SSADM data cannot flow directly from one data store to another — a process must move it. Flows between external entities may be drawn dashed.'],
 ['SSADM දත්ත ගැලීම් ආකෘතිකරණයට අනුව වැරදි ආකාරයට දත්ත ගැලීම නිරූපණය වන්නේ කවර රූපයේ ද?',['රූපය (1)','රූපය (2)','රූපය (3)','රූපය (4)','රූපය (5)'],
  'SSADM හි දත්ත ගබඩාවක සිට තවත් දත්ත ගබඩාවකට දත්ත කෙලින්ම ගලා යා නොහැකි ය — ක්‍රියාවලියක් හරහා යා යුතු ය. බාහිර ආයතන අතර ගැලීම් කඩ ඉරෙන් පෙන්විය හැකි ය.'],{img:IMG('sp22-25'),fixed:true});
q(26,7,'Deployment',4,
 ['When the QR-code fuel dispensing system was introduced in Sri Lanka, it was first tried in the suburbs of Colombo and then implemented in other districts. Which deployment method best describes this?',['Parallel installation','Direct installation','Phased installation','Pilot installation','None of the above'],
  'Trying the whole system in one area first and then rolling it out everywhere is pilot installation. Phased installation brings in the system part by part.'],
 ['QR කේතය භාවිතයෙන් ඉන්ධන නිකුත් කිරීමේ ක්‍රමය ශ්‍රී ලංකාවේ ක්‍රියාත්මක කිරීමේ දී පළමුව කොළඹ තදාසන්න ප්‍රදේශවල අත්හදා බලා අනෙක් දිස්ත්‍රික්කවල ක්‍රියාත්මක කිරීම ආරම්භ කළේ ය. මෙයට වඩාත් උචිත ස්ථාපන ක්‍රමය කුමක් ද?',['සමාන්තර ස්ථාපනය','සෘජු ස්ථාපනය','අදියර ස්ථාපනය','නියාමක (pilot) ස්ථාපනය','ඉහත කිසිවක් නොවේ'],
  'මුළු පද්ධතියම එක් ප්‍රදේශයක මුලින් අත්හදා බලා පසුව සියලු තැන්වල ක්‍රියාත්මක කිරීම නියාමක (pilot) ස්ථාපනයයි. අදියර ස්ථාපනයේ දී පද්ධතිය කොටසින් කොටස හඳුන්වා දෙයි.'],F);
q(27,7,'COTS',4,
 ['Which of the following is not an advantage of a Commercial Off-The-Shelf (COTS) package?',['The cost is split among a large number of people','Cost-effective production','It can be implemented in less time','It may take a long time to learn the software properly','Low training costs'],
  'Taking a long time to learn the software is a disadvantage. The others are why organisations buy COTS packages.'],
 ['වාණිජ පෙර නිමි පැකේජවල (Commercial Off-The-Shelf – COTS) වාසියක් නොවන්නේ කුමක් ද?',['පිරිවැය විශාල පිරිසක් අතර බෙදී යාම','නිෂ්පාදනය ලාභදායී වීම','අඩු කාලයකින් ක්‍රියාත්මක කළ හැකි වීම','මෘදුකාංගය නිවැරදිව ඉගෙන ගැනීමට දිගු කලක් ගත විය හැකි වීම','අඩු පුහුණු වියදම'],
  'මෘදුකාංගය ඉගෙනීමට දිගු කලක් ගත වීම අවාසියකි. අනෙක් ඒවා COTS පැකේජ මිලදී ගැනීමට හේතු වේ.']);
q(28,8,'ER to tables',3,
 ['Consider the ER diagram. How many tables are derived when it is mapped to a relational schema?',['1','2','3','4','5'],
  'Each of the two entities becomes a table, and the many-to-many relationship Work (with its attribute Type) becomes a third table holding both keys.'],
 ['දී ඇති ER සටහන සලකන්න. එය සම්බන්ධතා සැලැස්මකට (relational schema) සිතියම් කිරීමේ දී වගු කීයක් ලැබේ ද?',['1','2','3','4','5'],
  'භූතාර්ථ දෙක වගු දෙකක් වන අතර බහු-බහු (M:N) Work සම්බන්ධතාව (Type උපලක්ෂණය සමග) යතුරු දෙකම සහිත තෙවන වගුවක් වේ.'],{img:IMG('sp22-28'),fixed:true});
q(30,8,'Keys',5,
 ['Which of the following statements is true about relational databases?',['Any subset of alternate keys is called a candidate key.','The primary key is selected from the alternate keys.','A foreign key is an alternate key.','The primary and foreign keys are always combined to form a composite key.','The relationship between two tables is made by a primary key and a foreign key.'],
  'Tables are linked by placing the primary key of one table as a foreign key in the other. The primary key is chosen from the candidate keys; the rest are alternate keys.'],
 ['සම්බන්ධක දත්ත සමුදාය පිළිබඳ සත්‍ය වන්නේ පහත කවර වගන්තිය ද?',['විකල්ප යතුරුවල (Alternate keys) ඕනෑම උප කුලකයක් අපේක්ෂක යතුරක් (Candidate key) ලෙස හැඳින්වේ.','ප්‍රාථමික යතුර තෝරා ගන්නේ විකල්ප යතුරු අතරිනි.','ආගන්තුක යතුර (Foreign key) යනු විකල්ප යතුරකි.','සංයුක්ත යතුරක් සෑදීමට සෑම විටම ප්‍රාථමික හා ආගන්තුක යතුරු සංයුක්ත කෙරේ.','වගු දෙකක් අතර සම්බන්ධතාව ප්‍රාථමික හා ආගන්තුක යතුරු මගින් සිදු කරයි.'],
  'එක් වගුවක ප්‍රාථමික යතුර අනෙක් වගුවේ ආගන්තුක යතුර ලෙස තැබීමෙන් වගු සම්බන්ධ කෙරේ. ප්‍රාථමික යතුර තෝරන්නේ අපේක්ෂක යතුරු අතරිනි; ඉතිරි ඒවා විකල්ප යතුරු ය.']);
q(31,8,'SQL',4,
 ['Which of the following is an SQL command in the Data Definition Language (DDL)?',['INSERT','DELETE','UPDATE','ALTER','SELECT'],
  'DDL commands (CREATE, ALTER, DROP) change the structure of tables. INSERT, DELETE, UPDATE and SELECT work on the data (DML).'],
 ['දත්ත අර්ථ දැක්වීමේ භාෂාවේ (DDL) ඇති SQL විධානයක් වන්නේ පහත කවරක් ද?',['INSERT','DELETE','UPDATE','ALTER','SELECT'],
  'DDL විධාන (CREATE, ALTER, DROP) වගුවල ව්‍යුහය වෙනස් කරයි. INSERT, DELETE, UPDATE, SELECT දත්ත මත ක්‍රියා කරයි (DML).']);
q(32,8,'SQL',2,
 ['Consider the Student table. Which SQL statement gets the StudentID, Name and Zscore of the students whose Zscore exceeds 1.9?',['SELECT * FROM Student WHERE Zscore > 1.9;','SELECT StudentID, Name, Zscore FROM Student WHERE Zscore > 1.9;','SELECT StudentID, Name and Zscore FROM Student WHERE Zscore > 1.9;','SELECT StudentID, Name, Zscore FROM Student WHERE Zscore greater than 1.9;','SELECT StudentID. Name. Zscore FROM Student WHERE Zscore > 1.9;'],
  'List only the needed columns separated by commas, and use the > operator. SELECT * returns every column. (The original paper wrote => instead of >.)'],
 ['Student වගුව සලකන්න. Zscore අගය 1.9 ඉක්මවූ සිසුන්ගේ StudentID, Name සහ Zscore ලබා ගැනීමට අවශ්‍ය SQL ප්‍රකාශය කුමක් ද?',['SELECT * FROM Student WHERE Zscore > 1.9;','SELECT StudentID, Name, Zscore FROM Student WHERE Zscore > 1.9;','SELECT StudentID, Name and Zscore FROM Student WHERE Zscore > 1.9;','SELECT StudentID, Name, Zscore FROM Student WHERE Zscore greater than 1.9;','SELECT StudentID. Name. Zscore FROM Student WHERE Zscore > 1.9;'],
  'අවශ්‍ය තීරු පමණක් කොමා වලින් වෙන් කර ලියා > කාරකය භාවිත කරන්න. SELECT * සියලු තීරු ලබා දෙයි. (මුල් ප්‍රශ්න පත්‍රයේ > වෙනුවට => ලියා තිබිණි.)'],
 {code:'StudentID | Name    | Telephone  | Zscore\nS0001     | Dias    | 0713425178 | 1.9003\nS0002     | Perera  | 0712233445 | 1.5673\nS0003     | Madhawa | 0756789454 | 1.9453\nS0004     | Kumari  | 0772376894 | 1.2344\nS0005     | Sanduni | 0728646657 | 2.1103',edited:true,fixed:true});
q(33,9,'Flowcharts',1,
 ['Consider the following statements about the given flowchart.\nA – The output of the flowchart is 3.\nB – There are six iterations in the flowchart.\nC – At the end of the iteration the value of N is zero.\nD – Iteration is the only control structure in the flowchart.\nWhich of the above statement/s is/are true?',['A only','A and B only','B and D only','B, C and D only','All A, B, C and D'],
  'N takes 20, 17, 14, 11, 8, 5, 2 — seven iterations — and ends at −1. The odd values 17, 11 and 5 are counted, so 3 is displayed. The flowchart also has a selection (R != 0?).'],
 ['දී ඇති ගැලීම් සටහන සම්බන්ධයෙන් පහත වගන්ති සලකන්න.\nA – ගැලීම් සටහනේ ප්‍රතිදානය 3 කි.\nB – ගැලීම් සටහනේ පුනරාවර්තන හයක් ඇත.\nC – පුනරාවර්තනය අවසානයේ N හි අගය 0 වේ.\nD – ගැලීම් සටහනේ ඇති එකම පාලන ව්‍යුහය පුනරාවර්තනයයි.\nඉහත වගන්ති අතුරින් සත්‍ය වන්නේ කවරේ ද?',['A පමණි','A සහ B පමණි','B සහ D පමණි','B, C, D පමණි','A, B, C, D සියල්ල'],
  'N අගයන් 20, 17, 14, 11, 8, 5, 2 — පුනරාවර්තන හතකි — අවසානයේ N = −1. ඔත්තේ අගයන් 17, 11, 5 ගණන් වන නිසා 3 පෙන්වයි. සටහනේ තේරීමක් (R != 0?) ද ඇත.'],{img:IMG('sp22-33'),fixed:true});
q(34,9,'Pseudocode',4,
 ['Consider the following pseudocode. A student has the numbers [100, 83, 50, 29, 10, 60, 70] to enter for R, in that order. Which answer shows how many numbers can be entered for R and the output of the pseudocode?',['3, 50','4, 49','5, 10','1, 100','0, 0'],
  'Count starts at 1, so the condition Count > 3 is false at once and the loop never runs. Only the first number (100) is read, and Min = 100 is displayed.'],
 ['පහත ව්‍යාජ කේතය සලකන්න. R සඳහා ඇතුළත් කිරීමට ශිෂ්‍යයෙකු සතුව [100, 83, 50, 29, 10, 60, 70] සංඛ්‍යා එම පිළිවෙළින් ඇත. R සඳහා ඇතුළත් කළ හැකි සංඛ්‍යා ගණන හා ව්‍යාජ කේතයේ ප්‍රතිදානය දැක්වෙන පිළිතුර කුමක් ද?',['3, 50','4, 49','5, 10','1, 100','0, 0'],
  'Count ආරම්භ වන්නේ 1 සිට නිසා Count > 3 කොන්දේසිය මුලින්ම අසත්‍ය වී ලූපය කිසිවිටෙක ක්‍රියා නොකරයි. පළමු සංඛ්‍යාව (100) පමණක් කියවා Min = 100 පෙන්වයි.'],
 {code:'BEGIN\n  INPUT R\n  SET Min = R, Count = 1\n  WHILE Count > 3 DO\n    INPUT R\n    IF R < Min THEN\n      Min = R\n    ENDIF\n    Count = Count + 1\n  END WHILE\n  DISPLAY Min\nEND',fixed:true});
q(35,9,'Python operators',3,
 ['What is the value of the Python expression 4*(9%4+5/2)?',['16','14','14.0','12','9'],
  '9 % 4 = 1 and 5 / 2 = 2.5 (/ always gives a float), so 4 * 3.5 = 14.0.'],
 ['4*(9%4+5/2) යන පයිතන් ප්‍රකාශනය ඇගයීමෙන් ලැබෙන අගය කුමක් ද?',['16','14','14.0','12','9'],
  '9 % 4 = 1 සහ 5 / 2 = 2.5 (/ සෑම විටම float දෙයි). එබැවින් 4 * 3.5 = 14.0.'],F);
q(36,9,'Python data structures',1,
 ['What is the output of the following Python code?',['47.5','52.5','57.5','62.5','Syntax error'],
  'c[-1] is the last item of the tuple (15) and d[1] is 20. 8 + 4.5 + 15 + 20 = 47.5.'],
 ['පහත පයිතන් කේතයේ ප්‍රතිදානය කුමක් ද?',['47.5','52.5','57.5','62.5','කාරක රීති දෝෂයක් (Syntax error)'],
  'c[-1] යනු ටියුපලයේ අවසාන අගය (15) වන අතර d[1] යනු 20 ය. 8 + 4.5 + 15 + 20 = 47.5.'],
 {code:'a = 8; b = 4.5; c = (5, 10, 20, 15); d = [30, 20, 50, 10]\nprint(a + b + c[-1] + d[1])',fixed:true});
q(37,9,'Python loops',4,
 ['What is the output of the following Python code?',['1\n2\n3\n4\n5\n6\n7','7 7 7 7 7 7 7\n6 6 6 6 6 6\n5 5 5 5 5\n4 4 4 4\n3 3 3\n2 2\n1','1\n2 2\n3 3 3\n4 4 4 4\n5 5 5 5 5\n6 6 6 6 6 6\n7 7 7 7 7 7 7','1\n2 2\n3 3 3\n4 4 4 4\n5 5 5 5 5\n6 6 6 6 6 6','7 7 7 7 7 7 7\n6 6 6 6 6 6\n5 5 5 5 5\n4 4 4 4\n3 3 3\n2 2'],
  'range(1, 7) gives 1 to 6. Row i prints i, i times, then a new line — six rows ending with 6 6 6 6 6 6.'],
 ['පහත පයිතන් කේතයේ ප්‍රතිදානය කුමක් ද?',['1\n2\n3\n4\n5\n6\n7','7 7 7 7 7 7 7\n6 6 6 6 6 6\n5 5 5 5 5\n4 4 4 4\n3 3 3\n2 2\n1','1\n2 2\n3 3 3\n4 4 4 4\n5 5 5 5 5\n6 6 6 6 6 6\n7 7 7 7 7 7 7','1\n2 2\n3 3 3\n4 4 4 4\n5 5 5 5 5\n6 6 6 6 6 6','7 7 7 7 7 7 7\n6 6 6 6 6 6\n5 5 5 5 5\n4 4 4 4\n3 3 3\n2 2'],
  'range(1, 7) මගින් 1 සිට 6 දක්වා ලැබේ. i වන පේළියේ i අගය i වතාවක් මුද්‍රණය කර නව පේළියකට යයි — 6 6 6 6 6 6 න් අවසන් වන පේළි හයකි.'],
 {code:'for i in range(1, 7):\n    for x in range(i):\n        print(i, end=" ")\n    print()',fixed:true});
q(38,9,'Python functions',5,
 ['A, B and C call the following Python function. What are the outputs of A, B and C respectively?\nA – print(multiply(5))\nB – print(multiply(5, 6))\nC – print(multiply(x=8))',['0, 30, 80','0, 30, 40','25, 30, 40','25, 25, 80','50, 30, 80'],
  'The global y = 5 is not used — the parameter y defaults to 10. 5 × 10 = 50, 5 × 6 = 30, 8 × 10 = 80. (The original printed Return with a capital R.)'],
 ['පහත පයිතන් ශ්‍රිතය A, B, C අවස්ථා තුනේ දී කැඳවා ඇත. A, B, C මගින් ප්‍රතිදානය කරන අගයන් පිළිවෙළින් දැක්වෙන පිළිතුර කුමක් ද?\nA – print(multiply(5))\nB – print(multiply(5, 6))\nC – print(multiply(x=8))',['0, 30, 80','0, 30, 40','25, 30, 40','25, 25, 80','50, 30, 80'],
  'ගෝලීය y = 5 භාවිත නොවේ — y පරාමිතියේ පෙරනිමි අගය 10 යි. 5 × 10 = 50, 5 × 6 = 30, 8 × 10 = 80.'],
 {code:'y = 5\ndef multiply(x, y=10):\n    return x * y',fixed:true,edited:true});
q(39,9,'Python functions',1,
 ['What are the outputs of lines 6 and 7 of the following Python code, respectively?',['36, 10','36, 5','0, 10','0, 5','0, Syntax Error'],
  'Inside the function i = 5 is a local variable. 6 > 5, so 6² = 36 is returned. The global i is still 10.'],
 ['පහත පයිතන් කේතයේ 6 සහ 7 පේළි මගින් ලැබෙන ප්‍රතිදාන පිළිවෙළින් කුමක් ද?',['36, 10','36, 5','0, 10','0, 5','0, කාරක රීති දෝෂයකි'],
  'ශ්‍රිතය තුළ i = 5 ස්ථානීය විචල්‍යයකි. 6 > 5 නිසා 6² = 36 ලබා දෙයි. ගෝලීය i තවමත් 10 කි.'],
 {code:'1. i = 10\n2. def myFun(a):\n3.     i = 5\n4.     if a > i:\n5.         return a ** 2\n6. print(myFun(6))\n7. print(i)',fixed:true});
q(40,9,'Python loops',3,
 ['What is the output of the following Python code?',['3','7','5','0','2'],
  'Words with at most 4 letters: Rain, go, away, Come, Day — 5.'],
 ['පහත පයිතන් කේතය ක්‍රියාත්මක කළ විට ප්‍රතිදානය කුමක් ද?',['3','7','5','0','2'],
  'අකුරු 4 ට අඩු හෝ සමාන වචන: Rain, go, away, Come, Day — 5.'],
 {code:"list = ['Rain','go','away','Come','again','another','Day']\ni = wcount = 0\nwhile i < len(list):\n    if len(list[i]) <= 4:\n        wcount = wcount + 1\n    i = i + 1\nprint(wcount)"});
q(41,9,'Python files',2,
 ['Which of the following happens when the given Python code is executed?\nA – A new file named vowel.txt is created on the hard drive each time the code is executed.\nB – On re-execution the code creates vowel.txt only if it does not exist, and writes the data to the end of the file if it exists.\nC – No data is written to vowel.txt.\nD – Only "hello children" and "number of vowels" are written to vowel.txt.',['A only','B only','A and C only','B and C only','B and D only'],
  'Mode "a" creates the file if it is missing and otherwise appends to the end. The line written also contains the count (4), so D is not right.'],
 ['දී ඇති පයිතන් කේතය ක්‍රියාත්මක වන විට පහත ඒවායින් සිදු වන්නේ කුමක් ද?\nA – කේතය ක්‍රියාත්මක වන සෑම වාරයකම දෘඪ තැටිය මත vowel.txt නම් නව ගොනුවක් නිර්මාණය වේ.\nB – නැවත ක්‍රියාත්මක වන විට vowel.txt නොමැති නම් පමණක් එය නිර්මාණය කරන අතර පවතී නම් ගොනුවේ අගට දත්ත ලියයි.\nC – vowel.txt ගොනුවට කිසිදු දත්තයක් ලියවෙන්නේ නැත.\nD – vowel.txt ගොනුවට "hello children" සහ "number of vowels" පමණක් ලියවේ.',['A පමණි','B පමණි','A සහ C පමණි','B සහ C පමණි','B සහ D පමණි'],
  '"a" ප්‍රකාරය ගොනුව නොමැති නම් එය සාදන අතර ඇති නම් අගට එකතු කරයි. ලියන පේළියේ ගණන (4) ද ඇති නිසා D නිවැරදි නොවේ.'],
 {code:"f = open(\"vowel.txt\", \"a\")\nword = 'hello children'\ncount = 0\nvowel_s = ['a','e','i','o','u']\nfor i in word:\n    if i in vowel_s:\n        count = count + 1\nf.write(word + \"\\t\")\nf.write('number of vowels' + \"\\t\" + str(count) + '\\n')\nf.close()",fixed:true,chk:true});
q(42,10,'HTML lists',2,
 ['What output does the following HTML code render in a web browser?',['Output (1)','Output (2)','Output (3)','Output (4)','Output (5)'],
  'A definition list shows each <dt> term at the left with its <dd> descriptions indented below, not bold and not numbered. The two <dl> lists are separate blocks.'],
 ['පහත HTML කේතය වෙබ් අතිරික්සුවක විදැහූ විට ලැබෙන නිවැරදි ප්‍රතිදානය කුමක් ද?',['ප්‍රතිදානය (1)','ප්‍රතිදානය (2)','ප්‍රතිදානය (3)','ප්‍රතිදානය (4)','ප්‍රතිදානය (5)'],
  'අර්ථ දැක්වීම් ලැයිස්තුවක <dt> පදය වම් පසින් ද එහි <dd> විස්තර ඊට පහළින් ඇතුළට තල්ලු වී ද පෙන්වයි; තද අකුරු හෝ අංක නැත. <dl> දෙක වෙන් වූ කොටස් දෙකකි.'],
 {code:'<HTML>\n<Head><title>Type of lists</Title></Head>\n<Body>\n<DL>\n  <DT>Hardware</DT>\n  <dd>Input Devices</dd>\n  <dd>Output Devices</dd>\n  <dd>Computer Memory</dd>\n</DL>\n<DL>\n  <DT>Software</DT>\n  <dd>System Software</dd>\n  <dd>Application Software</dd>\n</DL>\n</Body>\n</Html>',img:IMG('sp22-42'),fixed:true});
q(43,10,'CSS',3,
 ['Which CSS code is incorrect according to the syntax rules?',['body{background-color: black;}','#id1{font-weight: bold; font-size:20px;}','H1; h3 {font-family: verdana; Times New Roman;}','P.class1{ font-family: verdana; font-size:20px;}','H4 {font-family: verdana, color:red;}'],
  'Selectors are grouped with a comma (h1, h3), not a semicolon, and "Times New Roman;" is not a property. Option (5) is a badly written value but still valid syntax.'],
 ['කාරක රීති අනුව වැරදි CSS කේතය කුමක් ද?',['body{background-color: black;}','#id1{font-weight: bold; font-size:20px;}','H1; h3 {font-family: verdana; Times New Roman;}','P.class1{ font-family: verdana; font-size:20px;}','H4 {font-family: verdana, color:red;}'],
  'වරක (selectors) කාණ්ඩ කරන්නේ කොමාවෙනි (h1, h3) මිස තිත් කොමාවෙන් නොවේ; "Times New Roman;" ගුණාංගයක් ද නොවේ. (5) හි අගය වැරදි ලෙස ලියා ඇතත් කාරක රීති අනුව වලංගු ය.'],{fixed:true,chk:true});
q(44,10,'HTML forms',4,
 ['A section of an HTML form and its HTML code are given. Which answer shows the terms for blanks 1 to 4 in order?',['text, submit, text, text','admin, submit, clear entries, submit','username, reset, reset, submit','admin, reset, Clear Entries, Submit','admin, reset, reset, submit'],
  'The text box shows its value "admin". The first button clears the form, so its type is reset and its label (value) is "Clear Entries"; the last button’s value is "Submit".'],
 ['HTML පෝරමයක කොටසක් සහ ඊට අදාළ HTML කේත කොටස දී ඇත. 1 සිට 4 දක්වා හිස්තැන්වලට යෙදිය යුතු පද පිළිවෙළින් දැක්වෙන පිළිතුර කුමක් ද?',['text, submit, text, text','admin, submit, clear entries, submit','username, reset, reset, submit','admin, reset, Clear Entries, Submit','admin, reset, reset, submit'],
  'පෙළ කොටුවේ අගය "admin" ය. පළමු බොත්තම පෝරමය හිස් කරන නිසා එහි වර්ගය reset වන අතර ලේබලය (value) "Clear Entries" ය; අවසාන බොත්තමේ value "Submit" ය.'],
 {code:'User name:<br>\n<input type="text" name="username" value="...1...">\nUser password:<br>\n<input type="password" name="psw"><br><br>\n<input type="...2..." value="...3...">\n<input type="submit" value="...4...">',img:IMG('sp22-44'),fixed:true});
q(45,10,'PHP',3,
 ['What is the output of the given PHP code?',['1,','7,','1,7,','4,10,','1,2,3,4,5,6,7,8,9,10,'],
  '$x takes 1, 4, 7, 10. Only the odd values 1 and 7 are echoed, each followed by a comma.'],
 ['දී ඇති PHP කේතයේ ප්‍රතිදානය කුමක් ද?',['1,','7,','1,7,','4,10,','1,2,3,4,5,6,7,8,9,10,'],
  '$x අගයන් 1, 4, 7, 10 වේ. ඔත්තේ අගයන් 1 සහ 7 පමණක් කොමාවක් සමග මුද්‍රණය වේ.'],
 {code:"<html>\n<body>\n<?php\nfor ($x = 1; $x <= 10; $x += 3)\n{\n    if ($x % 2 == 1)\n    {\n        echo $x, ',';\n    }\n}\n?>\n</body>\n</html>",fixed:true});
q(46,10,'CSS',4,
 ['Consider the following block of HTML code.\nA – It defines an internal style sheet and para1 is specified as a CSS class selector.\nB – It defines an internal style sheet and specifies para1 as a CSS id selector.\nC – The styles in the code can be used for different categories of elements in one web page.\nD – Using <h1 id=para1> Heading </h1>, the heading is displayed in red in the middle of the web page.\nWhich of the above statements are true?',['A and C only','B and C only','A and D only','B and D only','B, C and D only'],
  '#para1 is an id selector in an internal (<style>) sheet, so B is true and A false. An id belongs to one element only, so it is not meant for groups of elements; an <h1 id="para1"> is shown centred and red.'],
 ['පහත HTML කේත කොටස සලකන්න.\nA – එහි අභ්‍යන්තර විලාස පත්‍රයක් (Internal Style Sheet) අර්ථ දක්වා ඇති අතර para1 CSS ‘Class’ වරකයක් ලෙස දක්වා ඇත.\nB – එහි අභ්‍යන්තර විලාස පත්‍රයක් අර්ථ දක්වා ඇති අතර para1 CSS ‘Id’ වරකයක් ලෙස දක්වා ඇත.\nC – කේතයේ විලාස එක් වෙබ් පිටුවක විවිධ මූලාංග වර්ග සඳහා භාවිත කළ හැකි ය.\nD – <h1 id=para1> Heading </h1> භාවිතයෙන් Heading පාඨය පිටුවේ මැදට රතු පැහැයෙන් පෙන්විය හැකි ය.\nඉහත ප්‍රකාශ අතුරින් සත්‍ය වන්නේ කවරේ ද?',['A සහ C පමණි','B සහ C පමණි','A සහ D පමණි','B සහ D පමණි','B, C සහ D පමණි'],
  '#para1 යනු අභ්‍යන්තර (<style>) පත්‍රයක ඇති id වරකයකි — B සත්‍ය, A අසත්‍ය. id එකක් එක් මූලාංගයකට පමණක් අයත් වේ; <h1 id="para1"> මැදට රතු පැහැයෙන් පෙන්වයි.'],
 {code:'<!DOCTYPE html>\n<html>\n<head>\n<style>\n#para1 {\n  text-align: center;\n  color: red;\n}\n</style>',fixed:true,chk:true});
q(47,10,'Web publishing',4,
 ['Which of the following statements about publishing a website is false?',['Publishing a website on a server installed on your own computer (localhost) is called local publishing.','A free or paid web server can be used to publish a website on the Internet.','Well-known large companies maintain dedicated web servers for their websites.','Multiple websites cannot share the same web server when publishing websites.','Updating the website with scheduled backups and collecting statistics are signs of a well-maintained website.'],
  'Shared hosting puts many websites on one web server, so (4) is false.'],
 ['වෙබ් අඩවියක් ප්‍රසිද්ධ කිරීම පිළිබඳ පහත වගන්ති අතුරින් අසත්‍ය වගන්තිය කුමක් ද?',['වෙබ් අඩවියක් තම පරිගණකයේම ස්ථාපිත සේවාදායකයක් (Local Host) මත ප්‍රසිද්ධ කිරීම ස්ථානීය ප්‍රසිද්ධ කිරීම ලෙස හැඳින්වේ.','අන්තර්ජාලයේ වෙබ් අඩවියක් ප්‍රසිද්ධ කිරීමට නොමිලේ හෝ ගෙවීමෙන් වෙබ් සේවාදායකයක් ලබා ගත හැකි ය.','ප්‍රකට මහා පරිමාණ සමාගම් සිය වෙබ් අඩවි සඳහා කැපවූ වෙබ් සේවාදායක (Dedicated Web Servers) පවත්වාගෙන යයි.','වෙබ් අඩවි ප්‍රසිද්ධ කිරීමේ දී වෙබ් අඩවි කිහිපයකට එකම වෙබ් සේවාදායකය හවුලේ භාවිත කළ නොහැකි ය.','සැලසුම් කළ උපස්ථ (Scheduled Backup) සමග යාවත්කාලීන කිරීම හා සංඛ්‍යාලේඛන එක්රැස් කිරීම හොඳින් නඩත්තු වන වෙබ් අඩවියක ලක්ෂණ වේ.'],
  'හවුල් සත්කාරකත්වයේ (shared hosting) දී වෙබ් අඩවි රැසක් එකම සේවාදායකයක පවතී. එබැවින් (4) අසත්‍ය ය.']);
q(48,11,'Microcontrollers',3,
 ['Which of the following is not a correct difference between a microprocessor board and a microcontroller board? (microprocessor board | microcontroller board)',['Processing power is high | Low processing power','Speed is measured in gigahertz | Speed is measured in megahertz','Small in size and weight | Size and weight are large','Expensive | Cheap','Power consumption is high | Power consumption is low'],
  'It is the other way round: a microcontroller board is the small, light one, because the processor, memory and I/O are on one chip.'],
 ['ක්ෂුද්‍ර සකසන පුවරුවක් (Micro Processor board) සහ ක්ෂුද්‍ර පාලක පුවරුවක් (Micro Controller board) අතර නිවැරදි වෙනසක් නොවන්නේ කවරක් ද? (ක්ෂුද්‍ර සකසන පුවරුව | ක්ෂුද්‍ර පාලක පුවරුව)',['සකසන බලය වැඩි ය | සකසන බලය අඩු ය','වේගය ගිගාහර්ට්ස්වලින් මනී | වේගය මෙගාහර්ට්ස්වලින් මනී','ප්‍රමාණය හා බර අඩු ය | ප්‍රමාණය හා බර වැඩි ය','මිල වැඩි ය | මිල අඩු ය','විදුලි පරිභෝජනය වැඩි ය | විදුලි පරිභෝජනය අඩු ය'],
  'එය ප්‍රතිවිරුද්ධයයි: සකසනය, මතකය හා ආදාන/ප්‍රතිදාන එකම චිපයක ඇති නිසා කුඩා හා සැහැල්ලු වන්නේ ක්ෂුද්‍ර පාලක පුවරුවයි.']);
q(49,12,'E-commerce',3,
 ['Which is the incorrect statement about a reverse auction?',['The transaction starts at the request of the buyer.','The transaction takes place online, involving one buyer and many sellers.','The transaction is completed at the highest bid value.','The final transaction is completed with high benefit to the buyer.','There is high competition among sellers.'],
  'In a reverse auction sellers compete by lowering their prices, and the buyer accepts the lowest bid, not the highest.'],
 ['ප්‍රතිවෙන්දේසිය පිළිබඳ සදොස් වරණය කුමක් ද?',['ගැනුම්කරුගේ ඉල්ලීමකට අනුව ගනුදෙනුව ආරම්භ වේ.','ගනුදෙනුව අන්තර්ජාලය ඔස්සේ සිදු වන අතර එක් ගැනුම්කරුවෙකු හා විකුණුම්කරුවන් රාශියක් සම්බන්ධ වේ.','ඉදිරිපත් කළ ලංසු අතරින් වැඩිම වටිනාකම සහිත ලංසුවට ගනුදෙනුව සිදු වේ.','ගැනුම්කරුට වැඩි වාසියක් ලැබෙන අයුරින් ගනුදෙනුව සම්පූර්ණ වේ.','විකුණුම්කරුවන් අතර ඉහළ තරගකාරීත්වයක් ඇත.'],
  'ප්‍රතිවෙන්දේසියේ දී විකුණුම්කරුවන් මිල අඩු කරමින් තරග කරන අතර ගැනුම්කරු අඩුම ලංසුව භාර ගනී.']);
})();
