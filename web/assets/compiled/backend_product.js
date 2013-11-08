(function ($) {
    'use strict';

    var methods = {
        init: function(options) {
            var settings = $.extend({
              'prototypePrefix': false,
              'prototypeElementPrefix': '<hr />',
              'containerSelector': false
            }, options);

            return this.each(function() {
                show($(this), false);
                $(this).change(function() {
                    show($(this), true);
                });

                function show(element, replace) {
                    var id = element.attr('id');
                    var selectedValue = element.val();
                    var prototypePrefix = id;
                    if (false != settings.prototypePrefix) {
                        prototypePrefix = settings.prototypePrefix;
                    }

                    var prototypeElement = $('#' + prototypePrefix + '_' + selectedValue);
                    var container;

                    if (settings.containerSelector) {
                        container = $(settings.containerSelector);
                    } else {
                        container = $(prototypeElement.data('container'));
                    }

                    if (replace) {
                        container.html(settings.prototypeElementPrefix + prototypeElement.data('prototype'));
                    } else if (!container.html().trim()) {
                        container.html(settings.prototypeElementPrefix + prototypeElement.data('prototype'));
                    }
                };
            });
        }
    };

    $.fn.handlePrototypes = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.handlePrototypes' );
        }
    };
})(jQuery);

$(document).ready(function() {
    'use strict';

    $('a[data-collection-button="add"]').on('click', function (e) {
        var collectionContainer = $('#' + $(this).data('collection'));
        var lastElementNumber = (collectionContainer.children().length) - 1;
        $('#sylius_product_properties_' + lastElementNumber + ' .property-chooser').handlePrototypes({
            prototypePrefix: 'property-prototype',
            prototypeElementPrefix: '',
            containerSelector: '#sylius_product_properties_' + lastElementNumber + ' .control-group:last .controls'
        });
        $('#sylius_product_properties_' + lastElementNumber + ' .property-chooser').change(function() {
            $('#sylius_product_properties_' + lastElementNumber + ' .control-group:last .controls input, #sylius_product_properties_' + lastElementNumber + ' .control-group:last .controls select').each(function() {
                this.name = this.name.replace(/__name__/g, lastElementNumber);
                this.id = this.id.replace(/__name__/g, lastElementNumber);
            });
        });
    });
});
