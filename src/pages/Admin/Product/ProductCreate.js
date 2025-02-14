import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';  // Axios 인스턴스 가져오기
import './ProductAdmin.css';
import {toast} from "react-toastify";

function CreateProduct() {
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [options, setOptions] = useState([{ name: '', price: '', quantity: '', imageUrl: '' }]);
    const [productImages, setProductImages] = useState([{ imageUrl: '' }]); // 상품 이미지 관리
    const navigate = useNavigate();
    const BASE_URL = "http://localhost:8080";
    const token = localStorage.getItem('access'); // 저장된 JWT 토큰 가져오기

    // 옵션 필드의 값 변경을 처리하는 함수
    const handleOptionChange = (index, field, value) => {
        const newOptions = [...options];
        newOptions[index][field] = value;
        setOptions(newOptions);
    };

    // 이미지 필드의 값 변경을 처리하는 함수
    const handleImageChange = (index, value) => {
        const newImages = [...productImages];
        newImages[index].imageUrl = value;
        setProductImages(newImages);
    };

    // 옵션 추가
    const addOption = () => {
        setOptions([...options, { name: '', price: '', quantity: '', imageUrl: '' }]);
    };

    // 이미지 추가
    const addImage = () => {
        setProductImages([...productImages, { imageUrl: '' }]);
    };

    // 옵션 삭제
    const removeOption = (index) => {
        const newOptions = options.filter((_, idx) => idx !== index);
        setOptions(newOptions);
    };

    // 이미지 삭제
    const removeImage = (index) => {
        const newImages = productImages.filter((_, idx) => idx !== index);
        setProductImages(newImages);
    };

    // 데이터베이스에서 자식 카테고리 목록을 가져오는 함수 (Axios 사용)
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(BASE_URL+'/api/admin/category', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch category data');
                }

                const data = await response.json(); // JSON 데이터를 파싱하여 변수에 저장
                setCategories(data); // 자식 카테고리 목록 설정
                console.log("Fetched categories:", data);
            } catch (error) {
                console.error('카테고리 불러오기 실패:', error);
            }
        };

        fetchCategories();
    }, []);

    // 폼 제출 처리
    const handleSubmit = async (event) => {
        event.preventDefault();

        // 상품 데이터 객체 생성
        const productData = {
            name: productName,
            description: productDescription,
            categoryId: category,
            productDetails: options.length > 0 ? options.map(option => ({
                name: option.name,
                price: option.price,
                quantity: option.quantity,
                mainImage: option.imageUrl
            })) : [], // 옵션이 없으면 빈 배열로 처리
            productImages: productImages.length > 0 ? productImages.map(image => ({
                imageUrl: image.imageUrl
            })) : [] // 이미지가 없으면 빈 배열로 처리
        };

        try {
            // 상품 생성 요청
            const response = await fetch(BASE_URL+'/api/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(productData)  // 데이터를 JSON으로 변환하여 전송
            });

            if (!response.ok) {
                throw new Error('상품 생성 중 오류가 발생했습니다.');
            }

            const responseData = await response.json();
            toast.success('상품이 성공적으로 생성되었습니다.', {
                position: "top-center",
                autoClose: 2000,
            });
            navigate('/admin/product');
        } catch (error) {
            console.error('상품 생성 중 오류가 발생했습니다:', error);
            toast.error('상품 생성 중 오류가 발생했습니다.', {
                position: "top-center",
                autoClose: 2000,
            });
        }
    };

    return (
        <div className="container">
            <h2>신규 상품 생성</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>상품 이름:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>상품 설명:</label>
                    <textarea
                        className="form-control"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>카테고리:</label>
                    <select
                        className="form-control"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">카테고리를 선택하세요</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <hr></hr>
                <h3>상품 옵션</h3>
                {options.map((option, index) => (
                    <div key={index} className="form-group">
                        <label>옵션 {index + 1}</label>
                        <input
                            type="text"
                            placeholder="옵션 이름"
                            value={option.name}
                            onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                            required
                            className="form-control"
                        />
                        <input
                            type="number"
                            placeholder="옵션 가격"
                            value={option.price}
                            onChange={(e) => handleOptionChange(index, 'price', e.target.value)}
                            required
                            className="form-control"
                        />
                        <input
                            type="number"
                            placeholder="옵션 재고"
                            value={option.quantity}
                            onChange={(e) => handleOptionChange(index, 'quantity', e.target.value)}
                            required
                            className="form-control"
                        />
                        <input
                            type="text"
                            placeholder="이미지 URL"
                            value={option.imageUrl}
                            onChange={(e) => handleOptionChange(index, 'imageUrl', e.target.value)}
                            className="form-control"
                        />
                        <button type="button" onClick={() => removeOption(index)} className="btn btn-secondary">옵션 삭제
                        </button>
                    </div>
                ))}
                <hr></hr>
                <h3>상품 이미지</h3>
                {productImages.map((image, index) => (
                    <div key={index} className="form-group">
                        <label>이미지 {index + 1}</label>
                        <input
                            type="text"
                            placeholder="이미지 URL"
                            value={image.imageUrl}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            required
                            className="form-control"
                        />
                        <button type="button" onClick={() => removeImage(index)} className="btn btn-secondary">이미지 삭제</button>



                    </div>
                ))}


                <div>
                    <button type="button" onClick={addOption} className="btn btn-secondary">옵션 추가</button>
                    <button type="button" onClick={addImage} className="btn btn-secondary">이미지 추가</button>
                    <button type="submit" className="btn btn-secondary">상품 생성</button>
                </div>
            </form>
        </div>
    );
}

export default CreateProduct;
