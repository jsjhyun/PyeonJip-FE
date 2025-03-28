import React, { useState, useEffect } from 'react';
import { Collapse, initMDB } from 'mdb-ui-kit';
import { useLocation } from 'react-router-dom';
import { addLocalCart, addServerCart } from "../../utils/cartUtils";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Product.css';
import {useAuth} from "../../context/AuthContext";
import {useCart} from "../../context/CartContext";
import Comment from "./Comment";
import ProductDetailRate from "./ProductDetailRate";
import {toast, ToastContainer} from "react-toastify";
initMDB({ Collapse });

function ProductDetail() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const productId = queryParams.get('productId');
    const optionId = queryParams.get('optionId');
    const [commentUpdated, setCommentUpdated] = useState(false);
    const [comments, setComments] = useState([]);
    const { isLoggedIn, email} = useAuth();
    const {loadCartData} = useCart();
    const BASE_URL = "https://pyeonjip-mall.com";

    const [product, setProduct] = useState({
        productImages: [],
        productDetails: [],
        name: '',
        description: '',
    });

    const [selectedOption, setSelectedOption] = useState({
        mainImage: '',
        name: '',
        price: 0,
    });

    useEffect(() => {
        initMDB({ Collapse }); // 아코디언 초기화
    }, []);

    useEffect(() => {
        fetch(BASE_URL + `/api/products/${productId}`)
            .then((response) => response.json())
            .then((data) => {
                setProduct(data);
                const option = data.productDetails.find(detail => detail.id === parseInt(optionId));
                setSelectedOption(option || data.productDetails[0]); // 기본 옵션 설정

                // 원본 mainImage를 productImages 배열에 추가
                setProduct(prevProduct => ({
                    ...prevProduct,
                    productImages: [
                        { imageUrl: option ? option.mainImage : data.productImages[0].imageUrl },
                        ...data.productImages
                    ],
                }));
            })
            .catch((error) => console.error('Error fetching product details:', error));

        fetch(BASE_URL + `/api/comments/product/${productId}`)
            .then((response) => response.json())
            .then((data) => {
                setComments(Array.isArray(data) ? data : []);
            })
            .catch((error) => console.error('댓글을 가져오는 중 오류 발생:', error));

    }, [productId, optionId, commentUpdated]);

    const addToCart = () => {
        if(selectedOption.quantity <= 0) {
            toast.warn(`재고가 부족합니다.`,{
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }
        const cartItem = {
            optionId: selectedOption.id,
            quantity: 1,
        };


        if (isLoggedIn) {
            addServerCart(cartItem, email);
        } else {
            addLocalCart(cartItem, selectedOption);
        }
        loadCartData();
        toast.info(`${product.name}이(가) 장바구니에 추가되었습니다.`,{
            position: "top-center",
            autoClose: 3000,
            style: { width: "400px" }
        });
    };

    const handleOptionChange = (detail) => {
        setSelectedOption(detail);
        setProduct(prevProduct => ({
            ...prevProduct,
            productImages: [
                { imageUrl: detail.mainImage },
                ...prevProduct.productImages.slice(1)
            ],
        }));
    };

    return (

        <div className="container card border-0" style={{ width: '105%' }}>
            <div className="row">

                <div className=" card border-0 col-xl-6 d-flex flex-column"
                     style={{marginTop: '30px', marginLeft: '30px'}}>
                    <div style={{marginLeft: '40px', flex: 1}}>
                        <img
                            src={selectedOption.mainImage}
                            alt={product.name}
                            className="img-fluid"
                            style={{width: '100%', marginTop: '20px'}}
                        />
                    </div>
                    <hr></hr>
                    <div className="d-flex my-2" style={{marginTop: '10px', marginLeft: '40px', gap: '10px'}}>
                        {product.productImages.map((img, index) => (
                            <img
                                key={index}
                                src={img.imageUrl}
                                alt={`Product Image ${index + 1}`}
                                style={{
                                    width: '70px',
                                    cursor: 'pointer',
                                    borderBottom: selectedOption.mainImage === img.imageUrl ? '1px solid gray' : '', // 밑줄 스타일 추가
                                }}
                                onClick={() => setSelectedOption({...selectedOption, mainImage: img.imageUrl})}
                            />
                        ))}
                    </div>
                </div>
                <div className="card border-0 col-xl-4" style={{marginTop: '80px', marginLeft: '80px'}}>
                    <h4 className="fw-bold">{product.name}</h4>
                    <h6 className="fw-bold">{selectedOption.name}</h6>
                    <p>{product.description}</p>
                    <h4 className="fw-bolder">￦{selectedOption.price.toLocaleString()}</h4>
                    <ProductDetailRate comments={comments}/>

                    <hr></hr>

                    <div className="my-3">
                        <div className="d-flex justify-content-between col-xl-9">
                            <h6 style={{fontSize: '14px'}} className="fw-bold">배송비</h6>
                            <h6 style={{fontSize: '14px'}}>3,000원 / 착불</h6>
                        </div>
                        <div className="d-flex justify-content-between col-xl-9">
                            <h6 style={{fontSize: '14px'}} className="fw-bold">배송 정보</h6>
                            <h6 style={{fontSize: '14px'}}>주문제작 7일 이내 출고</h6>
                        </div>
                        <div className="d-flex justify-content-between col-xl-9">
                            <h6 style={{fontSize: '14px'}} className="fw-bold">조립 정보</h6>
                            <h6 style={{fontSize: '14px'}}>조립 설명서 동봉</h6>
                        </div>
                    </div>


                    <div className="my-3">
                        <h6 style={{fontSize: '15px'}}>다른 옵션</h6>
                        <div className="d-flex gap-3">
                            {product.productDetails.map((detail, index) => (
                                <img
                                    key={index}
                                    src={detail.mainImage}
                                    alt={`Option ${index + 1}`}
                                    style={{
                                        width: '70px',
                                        cursor: 'pointer',
                                        borderBottom: selectedOption.id === detail.id ? '1px solid gray' : '',
                                    }}
                                    onClick={() => handleOptionChange(detail)}
                                />
                            ))}
                        </div>
                    </div>

                    <button className="btn btn-dark my-4" onClick={addToCart}>
                        <i className="bi bi-cart-plus mx-1" style={{fontSize: '1.4rem'}}></i>
                        장바구니에 담기
                    </button>
                </div>

                <div className="accordion accordion-flush my-5" id="accordionFlushExample">
                    {/*1번 아코디언*/}
                    <div className="accordion-item">
                        <h2 className="accordion-header" id="flush-headingOne">
                            <button
                                data-mdb-collapse-init
                                className="accordion-button collapsed"
                                type="button"
                                style={{fontWeight: 'bold', fontSize: '23px'}}
                                data-mdb-target="#flush-collapseOne"
                                aria-expanded="false"
                                aria-controls="flush-collapseOne"
                            >
                                제품 설명
                            </button>
                        </h2>
                        <div
                            id="flush-collapseOne"
                            className="accordion-collapse collapse"
                            aria-labelledby="flush-headingOne"
                            data-mdb-parent="#accordionFlushExample"
                        >
                            <div className="accordion-body" style={{}}>
                                해당 제품은 공간에 자연스럽게 어우러지는 디자인과 실용성을 갖춘 제품입니다. <br/>
                                다양한 인테리어 스타일에 매칭하기 좋으며, 일상에서 편안한 사용감을 제공합니다. <br/>
                                깔끔한 디테일과 다용도로 활용 가능한 구조가 특징이며, 필요에 따라 여러 용도로 사용할 수 있습니다.


                            </div>
                        </div>
                    </div>
                    <div className="accordion-item">
                        <h2 className="accordion-header" id="flush-headingTwo">
                            <button
                                data-mdb-collapse-init
                                className="accordion-button collapsed"
                                type="button"
                                style={{fontWeight: 'bold', fontSize: '23px'}}
                                data-mdb-target="#flush-collapseTwo"
                                aria-expanded="false"
                                aria-controls="flush-collapseTwo"
                            >
                                치수
                            </button>
                        </h2>
                        <div
                            id="flush-collapseTwo"
                            className="accordion-collapse collapse"
                            aria-labelledby="flush-headingTwo"
                            data-mdb-parent="#accordionFlushExample"
                        >
                            <div className="accordion-body">
                                <h5>{product.description}</h5><br></br>
                                제품 치수는 측정 방식에 따라 ±1~3cm 오차가 발생할 수 있습니다. 설치 공간을 충분히 확인 후 구매해 주세요.

                            </div>
                        </div>
                    </div>
                    <div className="accordion-item">
                        <h2 className="accordion-header" id="flush-headingThree">
                            <button
                                data-mdb-collapse-init
                                className="accordion-button collapsed"
                                type="button"
                                style={{fontWeight: 'bold', fontSize: '23px'}}
                                data-mdb-target="#flush-collapseThree"
                                aria-expanded="false"
                                aria-controls="flush-collapseThree"
                            >
                                리뷰
                            </button>
                        </h2>
                        <div
                            id="flush-collapseThree"
                            className="accordion-collapse collapse"
                            aria-labelledby="flush-headingThree"
                            data-mdb-parent="#accordionFlushExample"
                        >
                            <div className="accordion-body">
                                <Comment comments={comments} setComments={setComments} isLoggedIn={isLoggedIn} email={email} productId={productId} setCommentUpdated={setCommentUpdated} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer/>
        </div>
    );
}
export default ProductDetail;
