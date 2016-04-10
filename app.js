var limit = 12;
var baseURL = {
	domain: 'http://pokeapi.co/',
	api: 'api/v1/',
	sprites: 'media/sprites/pokemon/'
	};
var pokemons = [];
var pokemonTypes = [];

function getPokemons (offset) {
	$('.loadMore').hide();
	$('.loading').show();
	$.ajax({
		dataType: 'json',
		url: baseURL.domain + baseURL.api + 'pokemon/?limit=' + limit + '&offset=' + offset,
		success: function(data) {
			if (!data) {
				console.log('Server returned no data');
				return false;
			}
			if ($.isArray(data.objects)) {
				var chunk = data.objects;
			}
			else {
				console.log('Server returned no pokemons');
				return false;
			}
			previewPokemons(chunk);
			findUniqueTypes(chunk);
			pokemons = pokemons.concat(chunk);
			var nextOffset = offset + limit;
			if (nextOffset<data.meta.total_count) {
				$('.loadMore').attr('data-offset', nextOffset);
				$('.loadMore').show();
			}
		},
		error: function(jqXHR, status, err) {
			console.log('Connection error, status:' + status + ' message: ' + err);
		},
		complete: function() {
			$('.loading').hide();
		}
	});
}
function previewPokemons (chunk) {
	if (!$.isArray(chunk)) {
		console.log('previewPokemons() requires first parameter to be an array');
		return false;
	}
	for (var i = 0; i<chunk.length; i++) {
		$('.pokemonList').append('<div data-id="' + chunk[i].national_id + '" class="interact pokemonPreview">' +
			'<img src="' + baseURL.domain + baseURL.sprites + chunk[i].national_id + '.png">' 
			+ '<p class="pokemonName">' + chunk[i].name + '</p>'
			+ '<div class="types">' + listTypes(chunk[i].types, '', 'interact') + '</div></div>');
	}
	return true;
}
function getPokemon (id) {
	/*retrieves one pokemon by national_id; I prefered to store pokemon info locally instead of API call,
	which takes ages every time*/
	if (!($.isNumeric(id) && Math.floor(id) == +id)) {
		console.log('getPokemon() requires first parameter to be an integer');
		return false;
	}
	for (var i = 0; i < pokemons.length; i++) {
		if (pokemons[i].national_id == id) {
			return pokemons[i];
		}
	}
	return null;
}
function showPokemon (id) {
	if (!($.isNumeric(id) && Math.floor(id) == +id)) {
		console.log('showPokemon() requires first parameter to be an integer');
		return false;
	}
	var pokemon = getPokemon(id);
	$('.stageImage').attr('src', baseURL.domain + baseURL.sprites + id + '.png');
	$('.stageName').html(pokemon.name + ' #' + leftpad(id, 3, 0));
	$('.stageType').html(listTypes(pokemon.types, ', '));
	$('.stageAttack').html(pokemon.attack);
	$('.stageDefense').html(pokemon.defense);
	$('.stageHP').html(pokemon.hp);
	$('.stageSPAttack').html(pokemon.sp_atk);
	$('.stageSPDefense').html(pokemon.sp_def);
	$('.stageSpeed').html(pokemon.speed);
	$('.stageWeight').html(pokemon.weight);
	$('.stageTotalMoves').html(pokemon.moves.length);
	$('.stage').show();
	return true;
}
function listTypes (types, sep, addClass) {
	if (!$.isArray(types)) {
		console.log('listTypes() requires first parameter to be an array');
		return false;
	}
	addClass = addClass || '';
	return types.map(function(type){
		    	return '<span data-type="' + type.name + '" class="' + addClass + ' pokemonType ' + type.name + '">' + type.name + '</span>';
			}).join(sep);
}
function findUniqueTypes (chunk) {
	/*finds in chunk new pokemon types that are not yet stored in pokemonTypes array and puts them there*/
	if (!$.isArray(chunk)) {
		console.log('findUniqueTypes() requires first parameter to be an array');
		return false;
	}
	chunk.map(function(pokemon){
		pokemon.types.filter(function(type){
			return !pokemonTypes.some(function(stored){
				return type.name === stored.name;
			});
		}).map(function(type){
			pokemonTypes.push(type);
		});
	});
	$('.typeSelect').html(listTypes(pokemonTypes, '', 'interact'));
	return true;
}

function selectType (type) {
	if($.type(type) !== "string") {
		console.log('selectType() requires first parameter to be a string');
		return false;
	}
	$('.typeSelect .' + type).toggleClass('selected');
	showSelectedTypes();
	return true;
}
function showSelectedTypes () {
	$('.selector').show();
	$('.pokemonPreview').hide();
	$('.typeSelect .pokemonType').filter('.selected').map(function(){
		 $('.pokemonPreview .' + $(this).attr('data-type')).parents('.pokemonPreview').show();
	});
	return true;
}
function showAllTypes () {
	$('.pokemonPreview').show();
	$('.selector').hide();
	$('.typeSelect .pokemonType').removeClass('selected');
	return true;
}
function leftpad (str, len, ch) {
/*lately infamous function, from https://github.com/stevemao/left-pad*/
	str = String(str);
	var i = -1;
	if (!ch && ch !== 0) ch = ' ';
	len = len - str.length;
	while (++i < len) {
		str = ch + str;
	}
	return str;
}


$(document).ready(function(){
		/*program starts here, the first chunk of pokemons is retrieved with 0 offset*/
		getPokemons(0);

		/*hereafter goes binding of all the interactive clicks with handlers*/
		$('.loadMore').click(function() {
			showAllTypes();
			getPokemons(parseInt($(this).attr('data-offset'), 10));
		});

		$('body').on('click', '.pokemonPreview', function() {
			showPokemon(parseInt($(this).attr('data-id'), 10));
		});

		$('body').on('click', '.pokemonType.interact', function(event) {
			event.stopPropagation();
			selectType($(this).attr('data-type'));
		});

		$('.resetSelect').click(showAllTypes);

		$('.stageClose').click(function() {
			$('.stage').hide();
		});
	});