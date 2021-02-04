import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShoppingFadFormService } from 'src/app/services/shopping-fad-form.service';
import { ShoppingFadValidators } from 'src/app/validators/shopping-fad-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder,
              private shoppingFadFormService: ShoppingFadFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {
    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required,
        Validators.minLength(2),
        ShoppingFadValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2),
        ShoppingFadValidators.notOnlyWhitespace]),
        email: new FormControl('',
          [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required,
                                     ShoppingFadValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required,
                                   ShoppingFadValidators.notOnlyWhitespace]),
        state: new FormControl('', Validators.required),
        country: new FormControl('', Validators.required),
        zipCode: new FormControl('', [Validators.required,
                                      ShoppingFadValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required,
                                     ShoppingFadValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required,
                                   ShoppingFadValidators.notOnlyWhitespace]),
        state: new FormControl('', Validators.required),
        country: new FormControl('', Validators.required),
        zipCode: new FormControl('', [Validators.required,
                                     ShoppingFadValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required,
                                       ShoppingFadValidators.notOnlyWhitespace]),
        nameOnCard: new FormControl('', [Validators.required,Validators.minLength(2),
                                        ShoppingFadValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required,
                                          Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required,
                                            Validators.pattern('[0-9]{3}')]),
        expirationMonth: ['']
      })
    });

    //populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    console.log("startMonth: " + startMonth);
    this.shoppingFadFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      });
    //populate credit card years
    this.shoppingFadFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Received Credit Card years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );
    //populate countries
    this.shoppingFadFormService.getCountries().subscribe(
      data => {
        console.log("retrieved Countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );
  }

  //subscribe to cart service
  reviewCartDetails() {
     //subscribe to cart service total qunatity and this.totalPrice
     this.cartService.totalQuantity.subscribe(
       totalQuantity => this.totalQuantity = totalQuantity
     );
     this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }
  onSubmit() {
    console.log("Handling the submit button");
    console.log(this.checkoutFormGroup.get('customer').value);
    // to print formgroup element value
    //console.log("The email address is"+ this.checkoutFormGroup.get('customer').value.email);

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
     //set up order
     let order= new Order();
     order.totalPrice= this.totalPrice;
     order.totalQuantity= this.totalQuantity
     //get cart items
     const cartItems= this.cartService.cartItems;
     //create orderItems from cartItems
     //method1
     //let orderItems: OrderItem[]=[];
     //for(let i=0; i<cartItems.length; i++){
      // orderItems[i]= new OrderItem(cartItems[i]);
     //}
     //method 2
     let orderItems: OrderItem[]= cartItems.map(tempCartItem => new OrderItem(tempCartItem));
     //set up purchase
     let purchase=new Purchase();
     //populate purchase - customer
     purchase.customer= this.checkoutFormGroup.controls['customer'].value;
     purchase.shippingAddress=this.checkoutFormGroup.controls['shippingAddress'].value;
     const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
     const shippingCountry: Country= JSON.parse(JSON.stringify(purchase.shippingAddress.country));
     purchase.shippingAddress.state= shippingState.name;
     purchase.shippingAddress.country= shippingCountry.name;
     //populate puchase //address
     purchase.billingAddress=this.checkoutFormGroup.controls['billingAddress'].value;
     const billngState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
     const billingCountry: Country= JSON.parse(JSON.stringify(purchase.billingAddress.country));
     purchase.billingAddress.state= billngState.name;
     purchase.billingAddress.country= billingCountry.name;
     //populate purchase - order nad orderItems
     purchase.order= order;
     purchase.orderItems= orderItems;
     //cast api via the checkout service
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response =>{
          alert(`Your order has been received.\n order tracking number: ${response.orderTrackingNumber}`)
          //reset cart
          this.resetCart();
        },
        error: err => {
        alert(`There was an error: ${err.message}`);
        }
      }
    );

   // console.log("the Shipping address country is " + this.checkoutFormGroup.get('shippingAddress').value.country.name);
    //console.log("the Shipping address state is " + this.checkoutFormGroup.get('shippingAddress').value.state.name);
  }
  resetCart() {
    //reset the form and cart data
    this.cartService.cartItems=[];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    this.checkoutFormGroup.reset();

    this.router.navigateByUrl("/products");
  }

  // getter methods

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCaredSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }


  copyShippingAdressToBillingAddress(event) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls.billingAddress
        .setValue(this.checkoutFormGroup.controls.shippingAddress.value);

      //bug fix code
      this.billingAddressStates = this.shippingAddressStates;
    }
    else {
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingAddressStates = [];
    }

  }
  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const curentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);

    let startMonth: number;
    if (curentYear == selectedYear) {
      startMonth = new Date().getMonth() + 1;
    }
    else {
      startMonth = 1;
    }
    this.shoppingFadFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Received credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }
  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;
    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);
    this.shoppingFadFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        }
        else {
          this.billingAddressStates = data;
        }
        formGroup.get('state').setValue(data[0]);
      }
    );

  }
}
