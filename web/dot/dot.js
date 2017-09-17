/* 'rgba(1,2,3,4)' -> [1,2,3,4] */
function rgbaValue2IntArray(str) {
  var srgba = str.substring(
    str.substring(0, 4) == 'rgba' ? 5 : 4,
    str.length - 1);
  var rgba = srgba.split(', ');
  if (rgba.length == 3)
    rgba.push(255);
  return new Uint8Array([+rgba[0], +rgba[1], +rgba[2], +rgba[3]]);
}

/* 01020304 -> [1,2,3,4] */
function hexRgbaValue2IntArray(str) {
  var arr = new Uint8Array(str.length == 6 ? 3 : 4);
  for (var i = 0; i < str.length; ) {
    arr[i / 2] = parseInt(str.substring(i, i + 2), 16);
    i += 2;
  }

  return arr;
}

/* [1,2,3,4] -> 01020304 */
function rgba2Hex(rgba) {
  return rgba.reduce(function(s, n){
    var v = (+n).toString(16);
    return s + (v == 0 ? '00' : v.length == 2 ? v : '0' + v);
  }, '');
}

function SImage() {
    this.width = 0;
    this.height = 0;
    /* [[r,g,b,a],...] */
    this.data = []; 
}

SImage.prototype.writeTextFile = function() {
  var text = '';
  text += this.width + ',';
  text += this.height + ',';
  
  var len = this.data.length;
  this.data.forEach(function(rgba, index) {
    text += rgba2Hex(rgba);
    if (index < len - 1)
      text += ',';    
  });
  
  return text;
}

SImage.prototype.readFromTextFile = function(file, callback) {
  var reader = new FileReader();
  var simage = this;
  reader.onload = function() {
    var ints = this.result.split(',');
    simage.width = + ints.shift();
    simage.height = + ints.shift();
    
    ints.forEach(function(sn) {
      simage.data.push( hexRgbaValue2IntArray(sn) );
    });
    
    callback();
  };
  reader.readAsText(file);
}

var Signal = signals.Signal;

function Board(params) {
  var board = this;
  
  var colorPicker = params.colorPicker;
  var rowNum = params.rows;
  var colNum = params.cols;
  var width = 500;
  var height = 500;
  var gridEnabled = true;
  var DEFAULT_OUTLINE = '1px solid #dbdbdb';
  
  var divBoard = $("#board");
  divBoard.css({
    width: width + 'px',
    height: height + 'px',
    margin: '0 auto'
  });
  
  this.table = createTable();
  
  divBoard.append(this.table);
  
  this.signals = {
    cellOvered: new Signal(),
    cellClicked: new Signal()
  };
  
  this.enableGrid = function(enable) {
    gridEnabled = enable;
    var outline = gridEnabled ? DEFAULT_OUTLINE: '';
    for (var r = 0; r < rowNum; r++)
      for (var c = 0; c < colNum; c++)
        $(this.table.rows[r].cells[c]).css('outline', outline);
  }
  
  this.getSImage = function(data) {
    var data = [];
    for (var r = 0, rows = board.table.rows; r < rows.length; r++) {
      for (var c = 0, len = rows[r].cells.length; c < len; c++) {
        data.push( rgbaValue2IntArray( $(rows[r].cells[c]).css('background-color') ) );
      }
    }
    
    var simage = new SImage();
    simage.width = rowNum;
    simage.height = colNum;
    simage.data = data;
    
    return simage;
  }
  
  this.setSImage = function(simage) {
    var data = simage.data;
    var rows = this.table.rows;
    for (var i = 0, len = data.length; i < len; i++) {
      var r = Math.floor(i / simage.width);
      var c = i % simage.width;
      $(rows[r].cells[c]).css('background-color', '#' + rgba2Hex(data[i]));
    }
  }
  
  function createTable() {
    var table = $(document.createElement('table'));
    table.attr('cellpadding', 0);
    table.attr('cellspacing', 0);
    table.css({
      width: width + 'px',
      height: height + 'px',
      border: '2px solid black'
    });
    
    var cellW = (width - (colNum-1)*2) / colNum;
    var cellH = (height - (rowNum-1)*2) / rowNum;
    var tr, td;
    for (var r = 0; r < rowNum; r++) {
      tr = $(document.createElement('tr'));
      for (var c = 0; c < colNum; c++) {
        td = document.createElement('td');
        td.index = [r, c];
        td.id = r + '-' + c;
        
        td.onmouseover = function() {
          $(this).css({
            outline: '1px solid red',
          });
          board.signals.cellOvered.dispatch(this);
        };
        td.onmouseout = function() {
          $(this).css({
            outline: gridEnabled ? DEFAULT_OUTLINE: '',
          });
          board.signals.cellOvered.dispatch(this);
        };
        
        td.onclick = function() {
          board.signals.cellClicked.dispatch(this);
        };
        
        td = $(td);
        td.css({
          width: cellW + 'px',
          height: cellH + 'px',
          backgroundColor: '#FFFFFF',
          padding: 0,
          outline: gridEnabled ? DEFAULT_OUTLINE: '',
        });
        tr.append(td);
      }
      table.append(tr);
    }
    
    return table.get(0);
  }
  
}

function ColorPicker() {
  var value = '';
  
  this.setValue = function(_value) {
    value = _value;
    $('#txtColor').val(value);
    $('#txtColor').change();
  }
  this.getValue = function() {
    return value;
  }
  
  $('#txtColor').change(function() {
    value = this.value;
    $('#colorDisplay').css('background-color', value);
  });
}

function loadFile(files) {
  if(!files.length)
    return;
  var simage = new SImage();
  simage.readFromTextFile(files[0], function() {
    board.setSImage(simage);
  });
}

$(function() {
  window.colorPicker = new ColorPicker();
  colorPicker.setValue('#FF0000');
  
  window.board = new Board({
    rows: 24,
    cols: 24,
    colorPicker: colorPicker
  });
  
  var eraserMode = false;
  
  board.signals.cellOvered.add(function(cell) {
    $('#position').text('行:' + cell.index[0] + ' ' + '列:' + cell.index[1]);
  });
  board.signals.cellClicked.add(function(cell) {
    $(cell).css('background-color', eraserMode ? '' : colorPicker.getValue());
  });
  
  $('#eraserMode').change(function() {
    eraserMode = this.checked;
  });
  $('#toggleGridEnable').change(function() {
    board.enableGrid(this.checked);
  });
  

  $('#save').click(function(){
    var formatters = [];
  
    formatters['default'] = function(simage) {
      return simage.writeTextFile();
    };
  
    formatters['columns'] = function(simage) {
      return simage.data.map(function(rgba) {
        return rgba.join(',');
      }).join('\n');
    };
    
    var formatName = $('#selFormat').val();
    var formatter = formatters[formatName];
    
    var simage = board.getSImage();
    var output = formatter(simage);

    var blob = new Blob( [ output ], { type: 'text/plain;charset=utf8' } );
    var objectURL = URL.createObjectURL( blob );

    window.open( objectURL, '_blank' );
    window.focus();
  });
  
  $('#open').click(function(){ 
    var fileUpload = document.getElementById('file');
    if(fileUpload == null) {
        fileUpload = document.createElement('input');
        fileUpload.id = 'file';
        fileUpload.type = 'file';
        fileUpload.addEventListener('change', function() {
            loadFile(this.files);
        });
        document.body.appendChild(fileUpload);
    }

    fileUpload.click();
  });
});