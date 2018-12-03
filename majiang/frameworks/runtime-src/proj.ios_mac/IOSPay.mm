#import <Foundation/Foundation.h>
#import <StoreKit/StoreKit.h>
#import "IOSPay.h"
#import "scripting/js-bindings/manual/ScriptingCore.h"

static bool hasAddObserver=NO;

@interface PaymentController : UIViewController<SKPaymentTransactionObserver,SKProductsRequestDelegate>

@end

@implementation PaymentController
- (void)productsRequest:(SKProductsRequest *)request didReceiveResponse:(SKProductsResponse *)response {
   
    NSLog(@"-----------收到产品反馈信息--------------");
    NSArray *myProduct = response.products;
    NSLog(@"产品Product ID:%@",response.invalidProductIdentifiers);
    NSLog(@"产品付费数量: %d", (int)[myProduct count]);
    // populate UI
    for(SKProduct *product in myProduct){
        NSLog(@"product info");
        NSLog(@"SKProduct 描述信息%@", [product description]);
        NSLog(@"产品标题 %@" , product.localizedTitle);
        NSLog(@"产品描述信息: %@" , product.localizedDescription);
        NSLog(@"价格: %@" , product.price);
        NSLog(@"Product id: %@" , product.productIdentifier);
    }
    
    //NSArray *myProduct = response.products;
    if (myProduct.count == 0) {
        NSLog(@"无法获取产品信息，购买失败。");
        return;
    }
    SKPayment * payment = [SKPayment paymentWithProduct:myProduct[0]];
    [[SKPaymentQueue defaultQueue] addPayment:payment];
    
    if (!hasAddObserver)
    {
        hasAddObserver = YES;
        [[SKPaymentQueue defaultQueue] addTransactionObserver:self];
    }
}
- (void)paymentQueue:(SKPaymentQueue *)queue updatedTransactions:(NSArray *)transaction{
    for(SKPaymentTransaction *tran in transaction){
        
        switch (tran.transactionState) {
            case SKPaymentTransactionStatePurchased:
            {
                NSLog(@"交易完成");
                //UIManager::GetInstance()->CloseWindow("IOSPayWindow");
                NSString *receiptString=[[tran transactionReceipt] base64EncodedStringWithOptions:NSDataBase64EncodingEndLineWithLineFeed];
                //NSString *bodyString = [NSString stringWithFormat:@"{\"receipt-data\" : \"%@\"}", receiptString];
                //NSString* nsstr = [tran transactionReceipt];
                std::string str = [receiptString UTF8String];
                str = "gameclass.mod_platform.onbuy(\"" + str + "\")";
                ScriptingCore* engine = (ScriptingCore*)cocos2d::ScriptEngineManager::getInstance()->getScriptEngine();
                engine->evalString(str.c_str());
                [[SKPaymentQueue defaultQueue] finishTransaction:tran];
            }
                break;
            case SKPaymentTransactionStatePurchasing:
                NSLog(@"商品添加进列表");
                
                break;
            case SKPaymentTransactionStateRestored:
                NSLog(@"已经购买过商品");
                [[SKPaymentQueue defaultQueue] finishTransaction:tran];
                break;
            case SKPaymentTransactionStateFailed:
                NSLog(@"交易失败");
                [[SKPaymentQueue defaultQueue] finishTransaction:tran];
                break;
            default:
                break;
        }
    }
    //UIManager::GetInstance()->CloseWindow("NetworkStateWindow");
}
-(void)dealloc{
    [super dealloc];
    [[SKPaymentQueue defaultQueue] removeTransactionObserver:self];
}
@end

void IOSPay::Pay()
{
    GetProductInfo();
}

void IOSPay::GetProductInfo()
{
    
    if ([SKPaymentQueue canMakePayments]) {
        } else {
        NSLog(@"失败，用户禁止应用内付费购买.");
    }
    
    
    /*SKPayment * payment = [SKPayment paymentWithProductIdentifier:@"com.d2d.yykwx.50.3"];
    [[SKPaymentQueue defaultQueue] addPayment:payment];
    
    if (!hasAddObserver)
    {
        hasAddObserver = YES;
        static PaymentController * delegate = [PaymentController alloc];
        [[SKPaymentQueue defaultQueue] addTransactionObserver:delegate];
    }*/
    
    NSArray *product = [[NSArray alloc] initWithObjects:@"com.youyou.poker.fk_50",nil];

    NSSet * set = [NSSet setWithArray:product];
    SKProductsRequest * request = [[SKProductsRequest alloc] initWithProductIdentifiers:set];
    request.delegate = [PaymentController alloc];
    [request start];
}
