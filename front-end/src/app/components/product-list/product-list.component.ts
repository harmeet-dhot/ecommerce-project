import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[]= [];
  currentCategoryId:number =1;
  previousCategoryId: number;
  searchMode: boolean = false;

  //new properties for pagination
  thePageNumber: number =1;
  thePageSize: number=15;
  theTotalElements: number =0;

  previousKeyword: string=null;
 
  constructor(private productService : ProductService,
               private route: ActivatedRoute,
               private cartService: CartService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() =>{
       this.listProducts();
    });
  }

  listProducts(){
    //check if "id" parameter is available
    this.searchMode=this.route.snapshot.paramMap.has('keyword');
    if(this.searchMode){
      this.handleSearchProducts();
    }
    else{
    this.handleListProducts();
    }
  }
  handleListProducts(){
            const hasCategoryId: boolean= this.route.snapshot.paramMap.has('id');
            if(hasCategoryId){
              //get tge "id" param string, convert string to a number using the + symbol
            this.currentCategoryId=+this.route.snapshot.paramMap.get('id');
            }
            else{
              this.currentCategoryId=1;
            }
            //check if we have a different category than previous
          // Angualr will reuse a component if it is currently being viewed
            if(this.previousCategoryId != this.currentCategoryId){
              this.thePageNumber=1;
            }
            this.previousCategoryId=this.currentCategoryId;
            console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);

            // if we have a different category id than previous  the set PageNumber =1
              this.productService.getProductListPaginate(this.thePageNumber-1,
                                                          this.thePageSize,this.currentCategoryId)
                                                          .subscribe(this.processResult());
   }

  processResult(){
      return data=>{
  this.products=data._embedded.products;
  this.thePageNumber=data.page.number+1;
  this.thePageSize= data.page.size;
  this.theTotalElements= data.page.totalElements;
    };
  }

  handleSearchProducts(){
        const theKeyword: string= this.route.snapshot.paramMap.get('keyword');
        // if we have a different keyword than previos then set page number to 1
        if(this.previousKeyword != theKeyword)
        {
          this.thePageNumber=1;
        }
        this.previousKeyword=theKeyword;
        console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);
        
        this.productService.searchProductsPaginate(this.thePageNumber-1,
                                                  this.thePageSize,
                                                   theKeyword).subscribe(this.processResult());

   }
   updatePageSize(pageSize: number){
     this.thePageSize=pageSize;
     this.thePageNumber=1;
     this.listProducts();
   }
   addToCart(theProduct: Product){
     console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);

     // need to do real work
     const theCartItem= new CartItem(theProduct);
     this.cartService.addToCart(theCartItem);
   }
  }