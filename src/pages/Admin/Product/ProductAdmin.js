import React, { useEffect, useState } from 'react';
import ProductList from './ProductList';
import './ProductAdmin.css';
import axiosInstance from "../../../utils/axiosInstance";

function ProductAdmin() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 5;
    const BASE_URL = "https://pyeonjip-mall.com";

    // 대카테고리 목록 조회
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(BASE_URL+'/api/category', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                });

                const data = await response.json();  // JSON 응답을 파싱
                console.log("Fetched categories:", data);
                setCategories(data);  // 받아온 카테고리 데이터를 상태에 저장
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    // 전체 상품 조회 useEffect
    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await fetch(BASE_URL+'/api/products/all', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log("Fetched all products:", data);
                setProducts(data);
            } catch (error) {
                console.error("Error fetching all products:", error);
            }
        };

        if (!selectedCategory) {
            fetchAllProducts();
        }
    }, [selectedCategory]);

    // 카테고리 선택 시 해당 카테고리의 상품 불러오기
    useEffect(() => {
        const fetchProductsByCategory = async () => {
            try {
                if (selectedCategory) {
                    // 카테고리 데이터 가져오기
                    const categoryResponse = await fetch(BASE_URL+`/api/category?categoryIds=${selectedCategory}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                    });

                    if (!categoryResponse.ok) {
                        throw new Error('Failed to fetch category data');
                    }

                    const categoryIds = await categoryResponse.json();

                    // 쿼리 파라미터 구성
                    const queryParams = categoryIds.map(id => `categoryIds=${id}`).join('&');

                    // 제품 데이터 가져오기
                    const productResponse = await fetch(BASE_URL+`/api/products/categories?${queryParams}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                    });

                    if (!productResponse.ok) {
                        throw new Error('Failed to fetch product data');
                    }

                    const products = await productResponse.json();

                    setProducts(products);  // 가져온 제품 데이터를 상태에 저장
                }
            } catch (error) {
                console.error('Error fetching products by category:', error);
            }
        };

        if (selectedCategory) {
            fetchProductsByCategory();
        }
    }, [selectedCategory]);

    const paginatedProducts = products.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    const handleNextPage = () => {
        if ((currentPage + 1) * pageSize < products.length) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    return (
        <div className=" container card border-0 my-5">
            <h2 className="my-4 text-center">상품 관리 페이지</h2>

            <div className="mb-4">
                <label htmlFor="categorySelect">카테고리 선택:</label>
                <select
                    id="categorySelect"
                    className="form-select"
                    value={selectedCategory}
                    onChange={(event) => {
                        setSelectedCategory(event.target.value);
                        setCurrentPage(0); // 카테고리 선택 시 페이지를 0으로 초기화
                    }}
                >
                    <option value="">모든 카테고리</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {paginatedProducts.length > 0 ? (
                <>
                    <ProductList
                        products={paginatedProducts}
                        setProducts={setProducts} // setProducts를 props로 넘겨서 삭제 후 업데이트 가능
                    />
                    <div className="pagination">
                        <button onClick={handlePreviousPage} disabled={currentPage === 0}>이전</button>
                        <span>페이지 {currentPage + 1} / {Math.ceil(products.length / pageSize)}</span>
                        <button onClick={handleNextPage} disabled={(currentPage + 1) * pageSize >= products.length}>다음</button>
                    </div>
                </>
            ) : (
                <p>선택한 카테고리에 해당하는 상품이 없습니다.</p>
            )}
        </div>
    );
}

export default ProductAdmin;

