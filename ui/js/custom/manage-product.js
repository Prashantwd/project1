var productModal = $("#productModal");
$(function () {

    //JSON data by API call
    $.get(productListApiUrl, function (response) {
        if(response) {
            var table = '';
            $.each(response, function(index, product) {
                table += '<tr data-id="'+ product.product_id +'" data-name="'+ product.name +'" data-unit="'+ product.uom_id +'" data-price="'+ product.price_per_unit +'">' +
                    '<td>'+ product.name +'</td>'+
                    '<td>'+ (product.uom_id === 1 ? 'per kg' : 'per item') +'</td>'+
                    '<td>'+ product.price_per_unit +'</td>'+
                    '<td><span class="btn btn-xs btn-danger delete-product">Delete</span></td></tr>';
            });
            $("table").find('tbody').empty().html(table);
        }
    });
});

// Save Product
$("#saveProduct").on("click", function () {
    var data = $("#productForm").serializeArray();
    var requestPayload = {
        product_name: null,
        uom_id: null,
        price_per_unit: null
    };
    
    for (var i=0;i<data.length;++i) {
        var element = data[i];
        switch(element.name) {
            case 'name':
                requestPayload.product_name = element.value;
                break;
            case 'uoms':
                requestPayload.uom_id = parseInt(element.value);  // Added parsing
                break;
            case 'price':
                requestPayload.price_per_unit = parseFloat(element.value);  // Added parsing
                break;
        }
    }
    
    // Validate the data
    if (!requestPayload.product_name || !requestPayload.price_per_unit) {
        alert('Please fill in all fields');
        return;
    }
    
    callApi("POST", productSaveApiUrl, {
        'data': JSON.stringify(requestPayload)
    }).done(function() {
        $('#productModal').modal('hide');
        // Reload the product list in the Order page if it exists
        if (window.opener && window.opener.loadProducts) {
            window.opener.loadProducts();
        }
    });
});

$(document).on("click", ".delete-product", function (){
    var tr = $(this).closest('tr');
    var data = {
        product_id : tr.data('id')
    };
    var isDelete = confirm("Are you sure to delete "+ tr.data('name') +" item?");
    if (isDelete) {
        callApi("POST", productDeleteApiUrl, data);
    }
});

productModal.on('hide.bs.modal', function(){
    $("#id").val('0');
    $("#name, #price").val('');
    $("input[name='uoms'][value='1']").prop("checked", true); // Reset to "per kg"
    productModal.find('.modal-title').text('Add New Product');
});

productModal.on('show.bs.modal', function(){
    // No need to fetch UOM data anymore
});