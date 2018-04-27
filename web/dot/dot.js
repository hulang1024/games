/* 'rgb(1,2,3)' -> [1,2,3] */
function rgbValue2IntArray(str) {
  var srgb = str.substring(4, str.length - 1);
  var rgb = srgb.split(', ');
  return new Uint8Array([+rgb[0], +rgb[1], +rgb[2]]);
}

/* 010203 -> [1,2,3] */
function rgbHexValue2IntArray(str) {
  var arr = new Uint8Array(3);
  for (var i = 0; i < str.length; ) {
    arr[i / 2] = parseInt(str.substring(i, i + 2), 16);
    i += 2;
  }

  return arr;
}

/* [1,2,3] -> 010203 */
function rgb2Hex(rgb) {
  return rgb.reduce(function(s, n){
    var v = (+n).toString(16);
    return s + (v == 0 ? '00' : v.length == 2 ? v : '0' + v);
  }, '');
}

function copyArray(dest, src) {
  for (var i = 0; i < src.length; i++)
    dest[i] = src[i];
  return dest;
}

function reverseRange(array, begin, end) {
  var l = begin;
  var r = end - 1;
  var temp1, temp2;
  for(; l < r; l++, r--) {
    temp1 = array[l];
    temp2 = array[r];
    array[l] = temp2;
    array[r] = temp1;
  }
}

function SImage() {
    this.width = 0;
    this.height = 0;
    /* [[r,g,b],...] */
    this.data = [];
}

SImage.prototype.writeTextFile = function() {
  var text = '';
  text += this.width + ',';
  text += this.height + ',';

  var len = this.data.length;
  this.data.forEach(function(rgba, index) {
    text += rgb2Hex(rgba);
    if (index < len - 1)
      text += ',';
  });

  return text;
}

SImage.prototype.readFromText = function(text) {
  var simage = this;
  var ints = text.split(',');
  simage.width = + ints.shift();
  simage.height = + ints.shift();

  ints.forEach(function(sn) {
    simage.data.push( rgbHexValue2IntArray(sn) );
  });
}

SImage.prototype.readFromTextFile = function(file, callback) {
  var reader = new FileReader();
  var simage = this;
  reader.onload = function() {
    simage.readFromText(this.result);
    callback();
  };
  reader.readAsText(file);
}

var Signal = signals.Signal;

function Board(params) {
  var board = this;
  var rowNum = params.rows;
  var colNum = params.cols;
  var width = 600;
  var height = 600;
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
    mousedowned: new Signal(),
    mousemoved: new Signal(),
    mouseuped: new Signal(),
    clicked: new Signal()
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
        data.push( rgbValue2IntArray( $(rows[r].cells[c]).css('background-color') ) );
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
      $(rows[r].cells[c]).css('background-color', '#' + rgb2Hex(data[i]));
    }
  }

  function createTable() {
    var table = document.createElement('table');
    table.onmousedown = function(event) {
      board.signals.mousedowned.dispatch(event);
    };
    table.onmouseup = function(event) {
      board.signals.mouseuped.dispatch(event);
    };

    table = $(table);
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
        td.position = {y: r, x: c};
        td.id = r + '-' + c;

        td.onmousemove = function(event) {
          board.signals.mousemoved.dispatch(event);
        };
        td.onclick = function(event) {
          board.signals.clicked.dispatch(event);
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


function ColorSelector() {
  var selectedRgb = '000000';
  var nextIndex = 0;
  var COLOR_TABLE_ROWS = 3;
  var COLOR_TABLE_COLS = 10;

  this.getRgbIntArray = function() {
    return rgbHexValue2IntArray(selectedRgb);
  }

  this.getCode = function() {
    return '#' + selectedRgb;
  }

  this.add = function(rgb) {
    if (nextIndex == COLOR_TABLE_COLS) {
      for (var i = 0; i < COLOR_TABLE_COLS-1; i++)
        $(table.rows[2].cells[i]).css('background-color',
          $(table.rows[2].cells[i + 1]).css('background-color'));
      nextIndex--;
    }
    var cell = table.rows[2].cells[nextIndex];
    cell.enabled = true;
    cell.rgb = rgb;
    $(cell).css('background-color', '#' + rgb);
    nextIndex++;
  }

  var table = $('#colorTable').get(0);
  var tr, td;
  var cellSize = 20;
  var rgbs = [
    ['000000', '7f7f7f', '880015', 'ed1c24', 'ff7f27',
     'fff200', '22b14c', '00a2e8', '3f48cc', 'a349a4'],
    ['ffffff', 'c3c3c3', 'b97a57', 'ffaec9', 'ffc90e',
     'efe4b0', 'b5e61d', '99d9ea', '7092be', 'c8bfe7']];

  for (var r = 0; r < COLOR_TABLE_ROWS; r++) {
    tr = document.createElement('tr');
    for (var c = 0; c < COLOR_TABLE_COLS; c++) {
      td = document.createElement('td');
      td.rgb = (r < 2 ? rgbs[r][c] : 'f5f6f7');
      td.enabled = r < 2;
      td.onclick = function() {
        if (!this.enabled)
          return;
        selectedRgb = this.rgb;
        $('#selectedColorDisplay').css('background-color', '#' + selectedRgb);
      };
      td.onmouseover = function() {
        $(this).css('outline', '1px solid #' + this.rgb);
      };
      td.onmouseout = function() {
        $(this).css('outline', '');
      };
      $(td).css({
        width: (cellSize - 4) + 'px',
        height: (cellSize - 4) + 'px',
        backgroundColor: '#' + td.rgb,
        padding: 0,
        border: '1px solid #a0a0a0'
      });

      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  $('#selectedColorDisplay').css('background-color', '#' + selectedRgb);
}

function ColorPicker() {
}

function Eraser() {

}

function ColorFiller() {
  this.fill = function(color, position, simage) {
    fill(color, position.x, position.y, simage);
  };

  function fill(color, x, y, simage) {
    if ((0 <= x && x < simage.width) && (0 <= y && y < simage.height)
      && isFillable(simage.data[y * simage.width + x])) {
      simage.data[y * simage.width + x] = color;
      fill(color, x - 1, y, simage);
      fill(color, x + 1, y, simage);
      fill(color, x, y - 1, simage);
      fill(color, x, y + 1, simage);
    }
  }

  function isFillable(rgb) {
    return rgb.reduce(function(s, n){ return s + n; }, 0) >= 765;
  }
}

function Selector(board) {
  var vec1 = null, vec2 = null;
  var lastRect;

  this.signals = {
    selected: new Signal()
  };

  this.onClick = function(event) {
    if (vec1 == null) {
      vec1 = event.target.position;
      setRangeRect(false);
      showVec(vec1, true);
    } else {
      vec2 = event.target.position;
      var rect = {};
      rect.x = Math.min(vec1.x, vec2.x);//left vec
      rect.y = Math.min(vec1.y, vec2.y);
      rect.width = Math.abs(vec1.x - vec2.x) + 1;
      rect.height = Math.abs(vec1.y - vec2.y) + 1;
      lastRect = rect;

      setRangeRect(true);
      vec1 = vec2 = null;

      this.signals.selected.dispatch(rect);
    }
  };

  this.getRangeRect = function() {
    return lastRect;
  }

  this.setRangeRect = setRangeRect;

  function setRangeRect(b) {
    var rect = lastRect;
    if (!rect)
      return;
    showVec(vec1, b);
    showVec(vec2, b);

    for (var y = 0; y < rect.height; y++)
      for (var x = 0; x < rect.width; x++)
        $(board.table.rows[rect.y + y].cells[rect.x + x]).css('outline',
          b ? '1px dashed black' : '1px solid #dbdbdb');
  }

  function showVec(vec, b) {
    if (!vec)
      return;
    $(board.table.rows[vec.y].cells[vec.x]).css('outline',
      b ? '1px dashed black' : '1px solid #dbdbdb');
  }
}

function Clipboard() {
  var content = null;
  var isCut;

  this.copyRange = function(srcRect) {
    content = srcRect;
    isCut = false;
  }

  this.cutRange = function(srcRect) {
    content = srcRect;
    isCut = true;
  }

  this.pasteRange = function(destRect, simage) {
    var srcRect = content;
    if (destRect.width < srcRect.width || destRect.height < srcRect.height) {
      alert('目标矩形尺寸小于源矩形尺寸');
      return;
    }

    for (var y = 0; y < srcRect.height; y++)
      for (var x = 0; x < srcRect.width; x++)
        copyArray(
          simage.data[(destRect.y + y) * simage.width + destRect.x + x],
          simage.data[(srcRect.y + y) * simage.width + srcRect.x + x]);

    if (isCut) {
      clearRange(srcRect, simage);
    }
  }

  this.hasContent = function() {
    return content;
  }
}

function clearRange(rect, simage) {
  for (var y = 0; y < rect.height; y++)
    for (var x = 0; x < rect.width; x++)
      copyArray(
        simage.data[(rect.y + y) * simage.width + rect.x + x],
        [255,255,255,255]);
}

function flipHorizontal(rect, simage) {
  var left;
  for (var y = 0; y < rect.height; y++) {
    left = (rect.y + y) * simage.width + rect.x;
    reverseRange(simage.data, left, left + rect.width);
  }
}

function flipVertical(rect, simage) {
  var t, b;
  var temp1, temp2;
  var array = simage.data;
  for (var x = 0; x < rect.width; x++) {
    t = rect.y;
    b = rect.y + rect.height - 1;
    for(; t < b; t++, b--) {
      temp1 = array[t * simage.width + rect.x + x];
      temp2 = array[b * simage.width + rect.x + x];
      array[t * simage.width + rect.x + x] = temp2;
      array[b * simage.width + rect.x + x] = temp1;
    }
  }
}

function HistoryRecorder() {
  var stack = [];
  var top = -1;

  this.signals = {
    pushed: new Signal()
  };

  this.push = function(simage) {
    stack.push(simage);
    top++;
    this.signals.pushed.dispatch();
  }

  this.isBottom = function() {
    return top == 0;
  }
  this.isTop = function() {
    return top == stack.length - 1;
  }

  this.peek = function() {
    return stack[top];
  }

  this.undo = function() {
    if (top > 0)
      top--;
  }

  this.redo = function() {
    if (top <= stack.length - 1)
      top++;
  }
}

$(function() {
  var colorSelector = new ColorSelector();

  var historyRecorder = new HistoryRecorder();

  window.board = new Board({
    rows: 24,
    cols: 24
  });

  historyRecorder.push(board.getSImage());

  var selector = new Selector(board);
  var eraser = new Eraser();
  var colorFiller = new ColorFiller();
  var clipboard = new Clipboard();
  var nowTool;

  board.signals.mousemoved.add(function(event) {
    var position = event.target.position;
    if (event.buttons == 1) {
      if ((nowTool instanceof Selector) || (nowTool instanceof ColorFiller)) {
        return;
      }
      var cell = event.target;
      if (nowTool instanceof Eraser) {
        $(cell).css('background-color', 'transparent');
        historyRecorder.push(board.getSImage());
      } else {
        $(cell).css('background-color', colorSelector.getCode());
        historyRecorder.push(board.getSImage());
      }
    }
    $('#position').text('X:' + position.x + ', ' + 'Y:' + position.y);
  });

  board.signals.clicked.add(function(event) {
    var cell = event.target;

    if (!(nowTool instanceof Selector))
      selector.setRangeRect(false);

    if (nowTool instanceof Selector) {
      selector.onClick(event);
    } else if (nowTool instanceof ColorFiller) {
      var simage = board.getSImage();
      colorFiller.fill(colorSelector.getRgbIntArray(), cell.position, simage);
      board.setSImage(simage);
      historyRecorder.push(simage);
    }
  });

  selector.signals.selected.add(function(rect) {
    $('#copy,#cut,#clear,#flipHorizontal,#flipVertical').prop('disabled', false);
    if (clipboard.hasContent())
      $('#paste').prop('disabled', false);
  });

  historyRecorder.signals.pushed.add(function(){
    $('#undo').prop('disabled', false);
    $('#redo').prop('disabled', true);
  });

  $('#undo').click(function() {
    historyRecorder.undo();
    board.setSImage(historyRecorder.peek());
    $('#redo').prop('disabled', false);
    if (historyRecorder.isBottom()) {
      $(this).prop('disabled', true);
      $('#redo').prop('disabled', false);
    }
  }).prop('disabled', true);

  $('#redo').click(function() {
    historyRecorder.redo();
    board.setSImage(historyRecorder.peek());
    if (historyRecorder.isTop()) {
      $(this).prop('disabled', true);
      $('#undo').prop('disabled', false);
    }
  }).prop('disabled', true);

  $('#flipHorizontal').click(function() {
    var rect = selector.getRangeRect();
    var simage = board.getSImage();
    flipHorizontal(rect, simage);
    board.setSImage(simage);
    historyRecorder.push(simage);
  }).prop('disabled', true);

  $('#flipVertical').click(function() {
    var rect = selector.getRangeRect();
    var simage = board.getSImage();
    flipVertical(rect, simage);
    board.setSImage(simage);
    historyRecorder.push(simage);
  }).prop('disabled', true);

  $('#copy').click(function() {
    var srcRect = selector.getRangeRect();
    clipboard.copyRange(srcRect);
  }).prop('disabled', true);

  $('#paste').click(function() {
    var destRect = selector.getRangeRect();
    var simage = board.getSImage();
    clipboard.pasteRange(destRect, simage);
    board.setSImage(simage);
    historyRecorder.push(simage);
  }).prop('disabled', true);

  $('#cut').click(function() {
    var srcRect = selector.getRangeRect();
    clipboard.cutRange(srcRect);
  }).prop('disabled', true);

  $('#clear').click(function() {
    var rect = selector.getRangeRect();
    var simage = board.getSImage();
    clearRange(rect, simage);
    board.setSImage(simage);
    historyRecorder.push(simage);
  }).prop('disabled', true);

  $('#selector').change(function() {
    if (this.checked) {
      nowTool = selector;
      setCursorInBoard('selector');
    } else {
      nowTool = null;
      setCursorInBoard(null);
      selector.setRangeRect(false);
      $('#copy,#cut,#paste,#clear,#flipHorizontal,#flipVertical').prop('disabled', true);
    }
    $('#colorFiller,#eraser').prop('checked', false);
  }).prop('checked', false);

  $('#eraser').change(function() {
    if (this.checked) {
      nowTool = eraser;
      setCursorInBoard('eraser');
    } else {
      nowTool = null;
      setCursorInBoard(null);
    }
    $('#colorFiller,#selector').prop('checked', false);
  }).prop('checked', false);

  $('#colorFiller').change(function() {
    if (this.checked) {
      nowTool = colorFiller;
      setCursorInBoard('colorFiller');
    } else {
      nowTool = null;
      setCursorInBoard(null);
    }
    $('#eraser,#selector').prop('checked', false);
  }).prop('checked', false);

  $('#toggleGridEnable').change(function() {
    board.enableGrid(this.checked);
  });

  $('#editColor').click(function() {
    $('#colorEditor').toggle();
  });

  $('#addToCustomList').click(function() {
    colorSelector.add($('#rgbHex').val());
  });

  $('#save').click(function(){
    var formatters = [];

    formatters['default'] = function(simage) {
      return simage.writeTextFile();
    };

    formatters['columns'] = function(simage) {
      return simage.data.map(function(rgb) {
        return rgb.join(',');
      }).join('\n');
    };

    var formatName = $('#selFormat').val() || 'default';
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
        $(fileUpload).hide();
        fileUpload.addEventListener('change', function() {
          var files = this.files;
          if(!files.length)
            return;
          var simage = new SImage();
          simage.readFromTextFile(files[0], function() {
            board.setSImage(simage);
            historyRecorder.push(simage);
          });
        });
        document.body.appendChild(fileUpload);
    }

    fileUpload.click();
  });

  function setCursorInBoard(toolName) {
    $('#board').css('cursor', ({
      null: 'default',
      'selector': 'crosshair',
      'eraser': 'pointer',
      'colorFiller': 'default'
    })[toolName]);
  }

  // 初始化一个例子
  var simage = new SImage();
  simage.readFromText($('#ji_simage_data').text());
  board.setSImage(simage);
});
