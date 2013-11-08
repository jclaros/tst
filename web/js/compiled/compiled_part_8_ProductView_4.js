/**
 * Class that handles the dashboard rendering and callbacks
 */
window.themingStore.views.ProductView = window.themingStore.views.AbstractView.extend({

  // Variables and configuration

  /**
   * events to be catched by the view
   */
  events: {
    'submit #productForm'                     : 'submitProductForm',
    'change #productForm input[name="template[title]"]' : 'checkNameAvailability',
    'keyup  #productForm input[name="template[title]"]' : 'checkNameAvailability',
    'change .template-file input[type="file"]': 'templateUploader'
  },

  /**
   * Title of the page
   */
  title : 'ThemingSto.re - Product',

  /**
   * Time in milliseconds to wait to perform the title check
   */
  uniqueCheckDelay: 300,

  /**
   * This variable will hold the check method to check the title
   */
  _uniqueCkeckCaller: null,
  /**
   * the number of files in the queue
   */
  _numberfiles: 0,
  /**
   * file upload container
   */
  _files_container: [],
  /**
   * this saves the route to upload an url and download the content in the server
   */
  _url_load_from_external: "/rest/file/external_load",

  /**
   * this variable is used to hold the object that contains the template being displayed
   * @type {window.themingStore.models.ProductModel}
   */
  _template: null,
  // Methods

  /**
   * Constructor
   */
  initialize: function ()
  {
    _.bindAll(this,
      '_bindUploaderEngine',
      '_displayMainForm',
      '_createReq',
      '_bindUploadFileFromExternal',
      '_bindOneByOneUploader',
      '_hadleDropListener',
      'saveInArray',
      'processSaveFile',
      'retrieveIdOfElementForUpload'
    );
    // call the parent
    window.themingStore.views.AbstractView.prototype.initialize.call(this);
  },

  /**
   * The main action called when displaying the product index
   */
  index     : function ()
  {
  },

  /**
   * the action called when adding a product
   */
  add       : function ()
  {
    if (!window.themingStore.currentUser)
    {
      //window.themingStore.currentRouter.navigate('#/');
      //return;
    }
    this._template = new window.themingStore.models.ProductModel();
    this._displayMainForm(this._template);
  },

  /**
   * Performs the edit action displaying the form
   */
  edit: function (templateId)
  {
    if (!templateId)
    {
      window.themingStore.currentRouter.navigate('product/add');
      return;
    }
    this._template = new window.themingStore.models.ProductModel({'nid': templateId});
    this._displayMainForm(this._template);
  },

  /**
   * called when the save button is pressed in either the add or edit pages
   */
  submitProductForm: function (event) {
    var data    = $('#productForm').serializeObject();
    // create the template instance if it's not defined
    if (!this._template) this._template = new window.themingStore.models.ProductModel();
    // check if the title is set, it's the only condition to save
    if (data.title == '')
    {
      this.showError('Please set a title');
      return false;
    }

    this._template.save(data, {
      success: (function (xhr, response) {
        window.themingStore.currentRouter.navigate('product/edit/' + response['nid']);
      }).bind(this),
      error  : (function () {
        this.showError('error');
      }).bind(this)
    });
    return false;
  },

  templateUploader: function (event) {
    var self   = this;
    var $input = $(event.target);
    var files  = event.target.files;
    var url    = $input.attr('data-address');
    _.each(files, function (file, index) {
      if (!file.name.match(/\.zip$/))
      {
        self.showWarning('Only zip extension is allowed');
        return;
      }
      var reader    = new FileReader();
      reader.onload = function (event) {
        // the file has been read at this point
        // TODO: move this to a wrapper class, when the fixme is solved
        var result  = event.target.result;
        var options = {
          'url' : url,
          'headers': window.themingStore.currentUser.getHeaders(),
          'data': {
            'file' : {
              'file'    : result,
              'filename': file.name,
              'filepath': "public://" + file.name
            }
          },
          mimeType: 'multipart/form-data',
          dataType: 'json',
          type:"post",
          success:function(result){
            // the file has been uploaded to the server here
            self._updateUploadedFile(result);
          },
          method: 'post'
        };
        Backbone.sync('create', null, options);
        //$.ajax(options);
      };
      var ss = reader.readAsDataURL(file);
    });
  },

  /**
   * this method is called when the user updates the title field, checks if the
   * name desired is available
   * @param event the event that was fired
   */
  checkNameAvailability: function (event) {
    // if there is a function waiting, remove it
    if (this._uniqueCkeckCaller)
    {
      clearTimeout(this._uniqueCkeckCaller);
      this._uniqueCkeckCaller = null;
    }

    // create a timeout function
    this._uniqueCkeckCaller = setTimeout(
      (function () {

        var title = $('#productForm input[name="template[title]"]').val();
        var nid   = $('#productForm input[name="template[id]"]').val();
        var collection = new window.themingStore.collections.ProductCollection();

        // use the collection to get all templates with the title
        collection.fetch({
          'data': {
            'title' : title
          },

          // success is called even with an empty collection
          'success': (function () {
            if (collection.length)
            {
              // the rest has a title with the given name, check if the id
              // matches
              var product = collection.models[0];
              if (product.get('id') == id)
              {
                // the id matches, we are editing the same template, all is
                // fine, nothing to show
                return;
              }
              // we got here, the title is not from the same template, show the
              // error
              this.showError('The title "' + title + '"" is already taken.')
            }
            // no need for an else, we don't have anything to display
          }).bind(this),

          'error' : (function () {
            this.showError('Connection error');
          }).bind(this)
        });

      }).bind(this),
      this.uniqueCheckDelay
    );
  },

  /**
   * this method binds the behavior of the input file for media processing
   * @private
   */
  _bindUploaderEngine: function(){
    this._defineDragArea();
    this._disableBaseDropEvent();
    this._bindOneByOneUploader();
    this._bindUploadFileFromExternal();
  },
  /**
   * binds the upload from url process
   * @private
   */
  _bindUploadFileFromExternal: function(){
    var _this = this;

    $('.file_external_input_button').unbind('click').bind('click', function(evt){
      var url = prompt("url");

      _this._createReq(_this._url_load_from_external, "POST", {
        "url":url,
        "uid": window.themingStore.currentUser.attributes.uid
      }, function(data){
         if(data.status == "success"){
            // get location in the server and populate the box to handle the "upload process"
            // it had to arrive with a isimage attibute which should check if the file is a image file or not.
            var _pos = _this.saveInArray(data.file);
            var _img = _this.retrieveIdOfElementForUpload('img_id_', data.file);
            $('#'+_img).attr('src', data.file.src);
         }else{
            // there was an error
            // show popup
            _this.showError("error in the file process, maybe the file is corrupt");
         }
      }, function(error){
            // error in the request
        _this.showError(error);
      });


    });


  },
  /**
   * bind the Browse a file field button
   * @private
   */
  _bindOneByOneUploader: function(){
    var _this = this;
    $('#fileupload').bind('change', function(evt){
      evt.preventDefault();
      evt.stopPropagation();

      // handle the file uploaded
      var f = false;
      try{
        f = $(this)[0].files[0];
      }catch (e){
        // error log and report later
      }
      if(f){

        f.isimage = true;
        if(!f.type.match('image.*')){
          f.isimage = false;
        }

        var _pos = window.themingStore.currentView.saveInArray(f);

        if(!f.type.match('image.*')){
          // non image
          _this.addImageBox(f, _pos, true);
          return;
        }
        _this.addImageBox(f, _pos);

        // keep calm is a image show the preview
        // TODO: JON create this functions
        var reader = new FileReader();
        reader.onloadstart = _this._loadStart(f, _pos);
        reader.onprogress = _this._loadProgress(f);
        reader.onload = _this._loadListener(f);
        reader.readAsDataURL(f);
      }


      return;
    });


    $('.basic_listener').unbind('click').bind('click', function (event){
      $('#fileupload').trigger('click', event);
    });
  },
  /**
   * this method disabled the basic drop engine of the browsers usually the default engine makes them open the image
   * or file as a document and shows them a view
   * @private
   */
  _disableBaseDropEvent: function(){
    $(document).bind('drop dragover', function (e) {
      e.preventDefault();
    });
  },
    /**
     * test for the EJS integration and capabilities
     */
  testEjs : function(){
      var datatorender = {
          header: "Hi Dude",
          looper: [{
              prop1: "one",
              prop2: "two",
              prop3: "three"
          },{
              prop1: "one",
              prop2: "two",
              prop3: "three"
          },{
              prop1: "one",
              prop2: "two",
              prop3: "three"
          }]
      };
      var $rsp = new EJS({url:"templates/product/basic.ejs"}).render(datatorender);
      //$(".gallery-container").html($rsp);
      //console.log($rsp);
  },

  /**
   * binds the behaviors to render the multi selects
   * @private
   */
  _bindMultipleSelects: function () {
    var selectRenderer = function (element) {
      var $element = $(element);
      var options  = {};
      if ($element.attr('data-label-none-selected'))
      {
        options.emptyText = $element.attr('data-label-none-selected');
      }
      if ($element.attr('data-label-selected-text'))
      {
        options.selectedText = $element.attr('data-label-selected-text');
      }
      $element.dropdownchecklist(options);
    };

    _.each($('select[multiple]'), selectRenderer.bind(this));
  },

  /**
   * binds the stalker behavior
   * @private
   */
  _bindStalkerBehavior: function ()
  {
    var $stalkerElement   = $('.stalker-bar');
    var baseStalkerScroll = $stalkerElement.offset().top;
    var stalkerBind       = function (event)
    {
      if ($(window).scrollTop() > baseStalkerScroll)
      {
        $stalkerElement.addClass('stalking');
      }
      else
      {
        $stalkerElement.removeClass('stalking');
      }
    };

    $(window).scroll(stalkerBind.bind(this));
  },

  /**
   * The method in charge of display both the add and the edit forms
   * @private
   */
  _displayMainForm: function (template) {
    var categories = new window.themingStore.collections.CategoryCollection();
    var browsers   = new window.themingStore.collections.BrowserCollection();
    var layouts    = new window.themingStore.collections.LayoutCollection();
    var types      = new window.themingStore.collections.TemplateTypeCollection();
    var taxonomies = new window.themingStore.collections.TaxonomyCollection();
    this.loadAndFetch({
      'templates': ['product'],
      'models'   : [template, categories, browsers, layouts, types, taxonomies],
      'ready'    : (function () {
        // both the template and the model are ready, render the content
        this.$el.html(this.renderTemplate(
                      '#productAddPage',
                      {'template'  : template,
                       'categories': categories,
                       'browsers'  : browsers,
                       'layouts'   : layouts,
                       'types'     : types}));

        // bind the needed behaviors
        this._bindStalkerBehavior();
        this._bindMultipleSelects();
        this._bindUploaderEngine();
      }).bind(this)
    });
  },
  _defineDragArea: function(){
    var _this = this;
    var dropArea = document.getElementById("uploadercontainer");
    dropArea.addEventListener('dragover', _this._dragOverListener, false);
    dropArea.addEventListener('drop',     _this._hadleDropListener, false);
  },

  /**
   *
   * @param prefix
   * @param file
   * @returns String
   * @private
   */
  retrieveIdOfElementForUpload: function(prefix, file){
    return (prefix+file.name).replace(/[. \[\]"'()]/ig,'_');
  },
  /**
   * attached lister to handle the file hover
   * @param event
   * @private
   */
  _dragOverListener: function(event){
    event.stopPropagation();
    event.preventDefault();

  },
  /**
   * this method saves a file
   */
  processSaveFile: function(){
    var _this = this;
    if(_this._files_container.length > 0){
      $.each(_this._files_container, function(index, element){

        var _data;
        var cookie = "";
        var csrf = "";
        _data = new FormData();

        var _url = "http://localhost:81/rest/node/18/attach_file";

        if(!element.type.match('image.*')){
          _data.append('uid', window.themingStore.currentUser.attributes.uid);
          _data.append('field_name', "field_file");
          _data.append('files["one"]', element);
        }else{
          _data.append('uid', window.themingStore.currentUser.attributes.uid);
          _data.append('field_name', "field_screenshot");
          _data.append('files[]', element);
        }

        $el = $('#'+_this.retrieveIdOfElementForUpload('img_pg_', element));

        $.ajax({
          xhr: function(){

            var xhr = new window.XMLHttpRequest();

            xhr.upload.addEventListener("progress", function(event){
              if(event.lengthComputable){
                var percentage = event.loaded/event.total;
                if($el.length)
                {
                  percentage = percentage * 100;
                  $el.val(parseInt(percentage));
                }
              }
            }, false);

            /**
             * we do not track download speed
             */
            /*xhr.addEventListener("progress", function(event){
              //console.log("download");
              var percentage = 0;
              if(event.lengthComputable){

              }
            }, false);*/

            return xhr;
          },
          url: _url,
          data: _data,
          processData: false,
          type: 'POST',
          // This will override the content type header,
          // regardless of whether content is actually sent.
          // Defaults to 'application/x-www-form-urlencoded'
          contentType: false,
          // Now you should be able to do this:
          mimeType: 'multipart/form-data',    //Property added in 1.5.1
          headers:window.themingStore.currentUser.getHeaders(),
          success: function (data) {
            $el.val(100);
            $el.hide();
            console.log(data);
          }
        });
      });
    }else{
      // throw error or notify
    }
  },
  /**
   * base request creator
   * @param url
   * @param type
   * @param data
   * @param successf sucess function or callback
   * @param errorf error function or callback
   * @private
   */
  _createReq: function(url, type, data, successf, errorf){
    $.ajax({
      url: url,
      data: data,
      processData: false,
      type: type,
      contentType: false,
      mimeType: "multipart/form-data",
      headers:window.themingStore.currentUser.getHeaders(),
      success: successf,
      error: errorf
    });
  },
  /**
   * this method handles the file drop event
   * @param event
   * @private
   */
  _hadleDropListener: function(event){
    var _this = this;
    var _pos = 0;
    event.stopPropagation();
    event.preventDefault();

    var _files_being_dragged = event.dataTransfer.files;

    if(_files_being_dragged.length > 0){
        for(var i = 0, f; f = _files_being_dragged[i]; i++){
            // tricky think to do and could create an issue if current view changes form the intance of a class,
            // & this process runs, maybe a dependency injection in the top

            f.isimage = true;
            if(!f.type.match('image.*')){
              f.isimage = false;
            }
            _pos = window.themingStore.currentView.saveInArray(f);

            if(!f.type.match('image.*')){
              // non image
              _this.addImageBox(f, _pos, true);
              continue;
            }
            _this.addImageBox(f, _pos);

            // keep calm is a image show the preview
            // TODO: JON create this functions
            var reader = new FileReader();
            reader.onloadstart = _this._loadStart(f, _pos);
            reader.onprogress = _this._loadProgress(f);
            reader.onload = _this._loadListener(f);
            reader.readAsDataURL(f);
        }
    }
  },
  /**
   * basic load engine of the template in backbone for "preview"
   * @param _file
   * @param _pos
   * @private
   */
  _loadStart: function(_file, _pos){
    var _this = this;
    return function(event){
      var _tmplate = new EJS({url:'templates/product/add_image_template.ejs'}).render({data:_file, pos: _pos});
      var $basic_container = $('.gallery-container');

      if($basic_container.find('div.' +_this.retrieveIdOfElementForUpload('img_', _file) ).length === 0){
        $basic_container.append(_tmplate);
      }
    };
  },
  _loadProgress: function(_file){
    // log the progress
  },

  _loadListener: function(_file){
    var _this = this;
    return function(e){
      var _img = _this.retrieveIdOfElementForUpload('img_id_', _file);
      $('#'+_img).attr('src', e.target.result);
    }

  },
  /**
   * method used to add the image box in the carousel when the file has being fully uploaded.
   */
  addImageBox : function(_file, pos, _non_image){
    var _this = this;
    _non_image = typeof _non_image !== 'undefined' ? _non_image : (typeof _file.isimage !== 'undefined')? _file.isimage: false;


    var identif = _this.retrieveIdOfElementForUpload('img_id_', _file);
    var srcd = "";
    if(_non_image){
      srcd = "http://www.recyclethis.co.uk/wp-content/uploads/2008/07/hanging_files.jpg";
    }
    _file.dentif = identif;
    _file.srcc = srcd;
    var _tmplate = new EJS({url:'templates/product/add_image_template.ejs'}).render({"data":_file, "pos": pos, "srcc": srcd, dentif: identif });
    var $basic_container = $('.gallery-container');

    if($basic_container.find('div.' +_this.retrieveIdOfElementForUpload('img_', _file) ).length === 0){
      $basic_container.append(_tmplate);
    }

    return false;
  },
  /**
   * this method saves the file in a array to be uploaded later
   * @param file
   * @returns {Number}
   */
  saveInArray: function(file){
      return this._files_container.push(file);
  },
  delay: function(){
    _.delay(function(){ console.log('wops'); }, 5000);
  },

  /**
   * This method is called after the main file has been uploaded to the server, updates the UI
   * @param  {Object} result the object containing the fid and the address of the uploaded file
   * @private
   */
  _updateUploadedFile: function (result) {
    $('.template-uploader .template-file-icon').addClass('zip');
    var file = new window.themingStore.models.FileModel({'fid': result.fid});
    this.loadAndFetch({
      'models': [file],
      'ready' : (function () {
        $('.template-uploader .template-file-data').html(this.renderTemplate('#productFileUploaded', {file: file.attributes}));
      }).bind(this)
    })

  }
});
