import { formatPercent } from '@angular/common';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  
  cartItems: CartItem[] = [];
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  storage: Storage= sessionStorage;
  constructor() {
     // read data from storage
      let data=JSON.parse(this.storage.getItem('cartItems'));
      if(data!=null){
        this.cartItems=data;
      
        this.computeCartTotals();
      }
    }
  addToCart(theCartItem: CartItem) {
    let alreadyExistingInCart: boolean = false;
    let existingCartItem: CartItem = undefined;
    // check if we have already have the item in cart
    /*
        for( let tempCartItem of this.cartItems){
           if(tempCartItem.id === theCartItem.id){
             existingCartItem=tempCartItem;
             break;
           }
        }*/
    //using array.find
    existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);
    // find the item in cart beased on item id
    // check if it is found
    alreadyExistingInCart = (existingCartItem != undefined);
    if (alreadyExistingInCart) {
      existingCartItem.quantity++;
    }
    else {
      this.cartItems.push(theCartItem);
    }
    //compute cart total prioce and total quantity
    this.computeCartTotals();
  }
  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }
    //publish the new values all subscribers will receive the new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //log cart data just for debugging purposes
    this.logCartData(totalPriceValue, totalQuantityValue);

    //persist cart data
    this.persistCartItems();
  }
  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log(`Contents of the cart:`);
    for (let tempCartItem of this.cartItems) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity=${tempCartItem.quantity}, unitPrice= ${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`);


      console.log(`tottalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
      console.log(`--------------------`);

    }
  }
  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if(theCartItem.quantity===0){
      this.remove(theCartItem);
    }
    else{
      this.computeCartTotals();
    }
  }
  remove(theCartItem : CartItem){
    //  get index of item in array
    const itemIndex=this.cartItems.findIndex(tempCartItem => tempCartItem.id=== theCartItem.id);
    if(itemIndex > -1){
      this.cartItems.splice(itemIndex,1);
      this.computeCartTotals();
    }

  }
   persistCartItems(){
     this.storage.setItem('cartItems',JSON.stringify(this.cartItems));
   }

}
