import { memo } from "react";


interface ScrapedData {
    name: string;
    link: string;
    imagelink: string;
}

const PrintResultsFromScraper = memo(({ results }: any) => {

    //prints the results from the scrapping action
    return <div className="products">
        {
            results.map((data: ScrapedData) => {
                return <div className="product-card">
                    <div className="image-container-scraped">
                        <img src={data.imagelink} alt="Product Image" />
                    </div>
                    <h3 className="product-title">{data.name}</h3>
                    <a href={data.link} className="product-link" target="_blank">View Product</a>
                </div>

            })
        }
    </div>
})

export default PrintResultsFromScraper