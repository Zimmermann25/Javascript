class Node{
	constructor(xPos, yPos){
		this.xPos = xPos;
		this.yPos = yPos;
		this.next = null
	}
}

class LinkedList{
	
	curSize = 0;
	
	constructor(head=null){
		this.head = head;
		this.tail = null;
	}
	//nowy node jest wstawiany na początku listy
	addHead(xPos, yPos){
		if(this.head==null){
			this.head = new Node(xPos, yPos);
			this.tail = this.head;
		}
		else{
			var curHead = this.head;
			this.head = new Node(xPos, yPos);
			this.head.next = curHead;

		} 
		this.curSize +=1;
	}
	
	addTail(xPos, yPos){
		if(this.tail==null){
			this.head = new Node(xPos, yPos);
			this.tail = this.head;
		}else{
			var temp = new Node(xPos, yPos);
			this.tail.next = temp;
			this.tail = this.tail.next;
		}
		this.curSize +=1;
	}
	
	show(){
		var temp = this.head;
		while(temp !=null){
			console.log(temp.xPos,", ", temp.yPos);
			temp = temp.next;
		}
	}
	
	getHead(){
		if(this.head !=null)return [this.head.xPos, this.head.yPos];
		else return [null, null];
	}
	
	getTail(){
		if(this.tail !=null)return [this.tail.xPos, this.tail.yPos];
		else return [null, null];
	}
	
	moveHead(){//head to teraz kolejny element listy
		var temp = this.head;
		this.head = temp.next;
	}
	moveHeadAndAddTail(xPos, yPos){
		var temp = this.head;
		this.head = temp.next;
		var newTail = new Node(xPos, yPos);
		this.tail.next = newTail;
		this.tail = this.tail.next;
	}
}

window.onload=function()
{
	var canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	var direction = 'RIGHT';//domyslny kierunek, zmienna na kierunek, pozycje i pozycja głowy
	var changeto = direction;
	var score = 0;	
	var ratio = canvas.width/canvas.height; // do obliczenia wielkości węża
	var width_multiplier = 0;
	var height_multiplier = 0;
	var minRequiredPositions = 600; //wartość z ręki, pętla while przerwie się po przekroczeniu tej liczby(albo jeśli 1. warunek spelniony
	while((width_multiplier * height_multiplier <= Math.sqrt(canvas.width * canvas.height)) && (width_multiplier * height_multiplier <=minRequiredPositions)){
		if(ratio >=1){ // szersze niż wyższe, width > height
			height_multiplier +=1;
			width_multiplier += ratio;
		}else{
			height_multiplier +=ratio;
			width_multiplier += 1;
		}
	}
	width_multiplier = Math.floor(width_multiplier);
	height_multiplier = Math.floor(height_multiplier);
	if(ratio >=1){
		var snakeSize = Math.floor(canvas.height / height_multiplier);
	}else{
		var snakeSize = Math.floor(canvas.width / width_multiplier);
	}
	
	console.log("snakeSize: ", snakeSize, "wmult: ", width_multiplier, "hmult: ", height_multiplier, "ratio: ", ratio);
	
	var startX = snakeSize * Math.floor(width_multiplier/2);
	var startY = snakeSize * Math.floor(height_multiplier/2);
	var speed = 100;
	
	var pomarancza = new Image();
		pomarancza.src = 'pomarancza.png';
		pomarancza.onload = function(){}; // bez tego nie działa
	
	//zapis listy niejako od tyłu, by mieć złożoność O(1) dla wstawiania po obu stronach i nie gubić wskazników w liście
	//można powiedzieć, że przód i tył węża są zamienione !!!
	var snakeBody = new LinkedList();
	var snakePos = [startX + 2*snakeSize, startY]; //potem wymiennie moge stosowac snakePos, albo snakeBody.tail
	snakeBody.addHead(startX + 2*snakeSize, startY);
	snakeBody.addHead(startX + snakeSize, startY);
	snakeBody.addHead(startX, startY); // startowym head jest element po lewej
	
	var foodPos =[Math.floor(Math.random()* width_multiplier)*snakeSize, Math.floor(Math.random()* height_multiplier)*snakeSize];
	var foodSpawn = 'TRUE';//zmienna na spawn jedzenia, dymyslnie wyświetl jedzenie
	var snakePositionsArr = new Array(width_multiplier * height_multiplier).fill(0);//0 oznacza dozwoloną pozycję jedzenia, 
	var fillBySnakePositions = true;
	var onlyCorrectFoodPos = new Array(width_multiplier * height_multiplier).fill(0);//1 oznacza niepoprawną pozycje jedzenia
	
	//event na naciśnięcie WASD, (bez strzałek)
	document.addEventListener("keydown",function(event){
		if (event.keyCode === 65){changeto = 'LEFT'};//a
		if (event.keyCode === 68){changeto = 'RIGHT'};//d
		if (event.keyCode === 83){changeto = 'DOWN'};//s
		if (event.keyCode === 87){changeto = 'UP'};//w
	});

	game();

	function game(){		// main func
	
		//sprawdzenie  mozna poprawnie zmienic kierunek
		if ((changeto ==='RIGHT') &&  (direction !== 'LEFT')){direction = 'RIGHT'}  
		if ((changeto ==='LEFT') &&  (direction !== 'RIGHT')){direction = 'LEFT'}      
		if ((changeto ==='UP') && (direction !== 'DOWN')){direction = 'UP'}   
		if ((changeto ==='DOWN') && (direction !== 'UP')){direction = 'DOWN'}
		
		//po sprawdzeniu, zmiana pozycji głowy
		if (direction==='RIGHT'){snakePos[0] += snakeSize}
		if (direction==='LEFT'){snakePos[0] -= snakeSize}
		if (direction==='DOWN'){snakePos[1] += snakeSize}
		if (direction==='UP'){snakePos[1] -= snakeSize}
		//dodanie pozycji głowy na pierwsze miejsce w snakeBody	
	
		context.beginPath();//zielone tlo
		context.rect(0,0,canvas.width,canvas.height)
		context.fillStyle = 'green';
		context.fill();
		context.closePath();
		
		//snakePos oznacza aktualną pozycję głowy jeszcze przed narysowaniem, head to koniec węża, a tail to początek, ale jeszcze przed narysowaniem na pozycji snakePos
		var firstIndex = Math.floor(snakeBody.getTail()[1]/Math.round(snakeSize))*width_multiplier + Math.floor(snakeBody.getTail()[0]/Math.round(snakeSize));
		var lastIndex = Math.floor(snakeBody.getHead()[1]/Math.round(snakeSize))*width_multiplier + Math.floor(snakeBody.getHead()[0]/Math.round(snakeSize));
		var snakePosIndex = Math.floor(snakePos[1]/Math.round(snakeSize))*width_multiplier + Math.floor(snakePos[0]/Math.round(snakeSize));
		var markCollision = false; // czy wąż zjada siebie
		//console.log("firstIndex: ", firstIndex, " second: ", lastIndex);
		
		if ((snakePos[0] === foodPos[0]) && (snakePos[1] === foodPos[1])){// czy pozycja głowy i jedzenia taka sama
			//console.log("CATCHED FOOD");
			score+=1;//jedzenie złapane, wynik+1,zmiana wartosci foodSpawn, niżej 
			foodSpawn = 'FALSE';
			if (speed > 50 )speed -= 0.8;
			else speed=50; //nie schodz ponizej prędkosci 50
			
			snakeBody.addTail(snakePos[0], snakePos[1]);//tył weża "zatrzymany na jeden przebieg, a nowy element wstawiany jest na początku węża
			//var nextIndex = Math.floor(snakeBody.getTail()[1]/Math.round(snakeSize))*width_multiplier + Math.floor(snakeBody.getTail()[0]/Math.round(snakeSize));
			//console.log("nextIndex: ", nextIndex);
			snakePositionsArr[snakePosIndex] = 1;// dodaj z przodu na aktualną pozycję węża, 
			snakePositionsArr[firstIndex] = 1;//zaktualizuj wcześniejszy koniec
			
			/*for(var k=0; k<snakePositionsArr.length; k++){
				if(snakePositionsArr[k]==1)console.log("k: ", k);
			}*/
		}
		else {
			snakeBody.moveHeadAndAddTail(snakePos[0], snakePos[1]); //przemieszczanie sie
			if(snakePositionsArr[snakePosIndex]==1){ // jak aktualna pozycja węża(snakePos, 
				markCollision=true; //w miejscu, gdzie chce dodać nową pozycję głowę już jest inny element
			}
			snakePositionsArr[firstIndex] = 1; //dodaj z przodu 
			snakePositionsArr[lastIndex] = 0; //usuń z tyłu
		}
		
		//nowa pozycja jedzenia po zebraniu, w tym momencie zapisuje wszystkie zajęte pozycje do tablicy o rozmiarze width_multiplier*height_multiplier
		//w kolejnym przebiegu tworzę nową tablicę, do ktorej wstawiam tylko pozycje, gdzie nie ma aktualnie węża
		//z tej tablicy biore losowy element, który zawsze jest poprawny, złożoność obliczeniowa i pamięciowa O(N)
		//lepiej tak niż polegać na rozkładzie geometrycznym i sprawdzanie za każdym razem, a i tak musze mieć tablicę z zajętymi/wolnymi elementami do tego
		//Wartość oczekiwana w prawdopodobieństwie geometrycznym to 1/p, gdzie p = ilość wolnych pół / ilość wszystkich
		//dla N=1000 możliwych pól wymagana ilość losowań z rozkładu to ~7482.46, optymalizując, czy losuje z wolnych, czy zajętych: 1383.31 ~O(N), konkretniej pomiędzy O(N) i O(NLOGN)
		// I - N * 2*O(N) = O(N^2) - łączna złozoność czasowa potrzebna do poprawnego rozmieszczenia jedzenia aż do końca gry, pamięciowa 2 * O(N)
		// II rozklad geometrryczny czasowa: N * O(N) + O(N)(rozkład geom), pamięciowa O(N)
		//wybiorę pierwszą opcje, zysk z drugiej opcji będzie niewielki i opiera się na prawdopodobieństwie, nie na pewności
		var temp = snakeBody.head;
		
		while(temp !=null){
			context.beginPath();
			context.drawImage(pomarancza,temp.xPos,temp.yPos,snakeSize,snakeSize);//x1, y1, wielkosci
			context.closePath();
			context.stroke();  
			temp = temp.next;
		}

		if (foodSpawn ==='FALSE'){
			var temp = snakeBody.head;
			while(temp !=null){
				if(foodSpawn==='FALSE'){
					var arrIndex = Math.floor(temp.yPos/Math.round(snakeSize))*width_multiplier + Math.floor(temp.xPos/Math.round(snakeSize));
					snakePositionsArr[arrIndex] = 1; // w indeksie węża wstaw 1
				}
				temp = temp.next;
			}
			
			var counter = 0;
			var diffrentSnakePositions = 0;
			for(var i=0; i< snakePositionsArr.length; i++){
				if(snakePositionsArr[i]==0){
					onlyCorrectFoodPos[counter] = i;
					counter +=1;
				}else{ // pozycje węża, do sprawdzania kolizji
					diffrentSnakePositions +=1;
				}
			}
			
			var randomIndex = Math.round(Math.random() * (snakePositionsArr.length));
			foodPos = [ (randomIndex % width_multiplier)*snakeSize, Math.floor(randomIndex /width_multiplier) * snakeSize];
		}else{	
			context.beginPath();//rysowanie jedzenia
			context.rect(foodPos[0], foodPos[1], snakeSize, snakeSize);
			context.fillStyle = 'blue';
			context.fill();
			context.stroke();
			context.closePath();
		}
		
		foodSpawn = 'TRUE';	
		
		// szybkosc węża, za ile sekund wykonać tą funkcje ponownie, ala rekurencja, tyle że wyznacznikiem nie jest przypadek podstawowy, a czas w setTimeout
		x = setTimeout(game, speed); 
		
		if((snakePos[0] >=canvas.width) || (snakePos[0] <0)){	//gdy wejdzie w krawędz pola gry(szerokosc)
			clearTimeout(x);//przerwanie setTimeout, wynik
			alert('Koniec gry! Zdobyta ilość punktów: ' + score);
		}
		//gdy wejdzie w krawędz pola gry(wysokosc)
		if((snakePos[1] >=canvas.height ) || (snakePos[1] <0)){
			clearTimeout(x);//przerwanie setInterval, wynik
			alert('Koniec gry! Zdobyta ilość punktów: ' + score);
		}

		
		//możliwość kolizji muszę sprawdzać za kazdym razem
		//wykorzystam jedną dużą tablicę o rozmiarze width_multiplier*height multiplier, z każdym przebiegiem modyfikuje tylko pierwszą i ostatnią pozycję węża
		//wyliczam indeks, sprawdzam, czy wypełniony i jak tak, to koniec gry
		if(markCollision==true){
			clearTimeout(x);//przerwanie setInterval, wynik
			alert('Koniec gry! Zdobyta ilość punktów: ' + score);
		}
				
	}
};







