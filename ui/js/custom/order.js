var productPrices = {};

// Function to load products into the dropdown
function loadProducts() {
    $.get(productListApiUrl, function (response) {
        productPrices = {};
        if(response) {
            var options = '<option value="">--Select--</option>';
            $.each(response, function(index, product) {
                options += '<option value="'+ product.product_id +'">'+ product.name +'</option>';
                productPrices[product.product_id] = product.price_per_unit;
            });
            $(".product-box").find("select").empty().html(options);
        }
    });
}

$(function () {
    // Load products on page load
    loadProducts();
});

$("#addMoreButton").click(function () {
    var row = $(".product-box").html();
    $(".product-box-extra").append(row);
    $(".product-box-extra .remove-row").last().removeClass('hideit');
    $(".product-box-extra .product-price").last().text('0.0');
    $(".product-box-extra .product-qty").last().val('1');
    $(".product-box-extra .product-total").last().text('0.0');
});

$(document).on("click", ".remove-row", function (){
    $(this).closest('.row').remove();
    calculateValue();
});

$(document).on("change", ".cart-product", function (){
    var product_id = $(this).val();
    var price = productPrices[product_id];

    $(this).closest('.row').find('#product_price').val(price);
    calculateValue();
});

$(document).on("change", ".product-qty", function (e){
    calculateValue();
});

function calculateValue() {
    var grandTotal = 0;
    $(".product-box-extra .row").each(function() {
        var price = parseFloat($(this).find('#product_price').val());
        var quantity = parseFloat($(this).find('.product-qty').val());
        var total = price * quantity;
        $(this).find('.product-total').text(total.toFixed(2));
        grandTotal += total;
    });
    $('#product_grand_total').val(grandTotal.toFixed(2));
}

$("#saveOrder").on("click", function(){
    var formData = $("form").serializeArray();
    var requestPayload = {
        customer_name: null,
        total: null,
        order_details: []
    };
    
    var currentProduct = null;

    for(var i=0;i<formData.length;++i) {
        var element = formData[i];

        switch(element.name) {
            case 'customerName':
                requestPayload.customer_name = element.value;
                break;
            case 'product_grand_total':
                requestPayload.total = parseFloat(element.value);
                break;
            case 'product':
                // Only add product if it has a valid value
                if (element.value) {
                    currentProduct = {
                        product_id: parseInt(element.value),
                        quantity: null,
                        total_price: null
                    };
                    requestPayload.order_details.push(currentProduct);
                }
                break;
            case 'qty':
                // Only set quantity if we have a current product
                if (currentProduct) {
                    currentProduct.quantity = parseInt(element.value);
                }
                break;
            case 'item_total':
                // Only set total_price if we have a current product
                if (currentProduct) {
                    currentProduct.total_price = parseFloat(element.value);
                }
                break;
        }
    }

    // Validate the order
    if (!requestPayload.customer_name) {
        alert('Please enter customer name');
        return;
    }
    if (requestPayload.order_details.length === 0) {
        alert('Please add at least one product');
        return;
    }

    // Send the order
    callApi("POST", orderSaveApiUrl, {
        'data': JSON.stringify(requestPayload)
    });
});