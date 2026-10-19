import { useEffect, useState, useRef } from 'react';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import breakingNewsImage from '../../images/breaking_news.jpg'
import Cookies from 'js-cookie';

export default function NewsLoader({user, setUser}) {
    const [news, setNews] = useState([]);
    const [start, setStart] = useState(1);
    const [loading, setLoading] = useState(false);
    const csrftoken = Cookies.get('csrftoken');

    const logOut = async() => {
        await fetch("/police/api/auth/logout/", {
            method: "POST",
            credentials: "include",
            headers: {
                "X-CSRFToken": csrftoken,
            },
        });
        setUser(false);
    }

    // Persistent value between renders
    const loaderRef = useRef(null);

    async function loadArticles() {

        if (loading) return;

        setLoading(true);
        const response = await fetch(`/get_articles/${start}-${start+2}`);
        const data = await response.json();

        // Use previous states 
        setNews(prev => [...prev, ...data.Posts]);
        setStart(prev => prev + 3);
        setLoading(false);
    }

    // initial load after initial render
    useEffect(() => {
        loadArticles();
        logOut();
    }, []);
    
    // runs whenever start changes
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadArticles();
                }
            },
            {
                root: null, // use viewport as container
                rootMargin: "200px", // when element detection occurs
                threshold: 0 // how far into viewport before effect is triggered
            }
        );
        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }
        return () => observer.disconnect();
    }, [start]);
    
    return <>
        <Container id="news-loader">
            <Row>
                 {news.map((article, i) => (
                    <Col md={4} key={i}>
                        <Card className="column-card">
                            <Card.Img variant="top" src={ breakingNewsImage }/>
                            <Card.Title>{article}</Card.Title>
                            <Card.Text>Some News Message</Card.Text>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
         {/* sentinel element */}
            <div ref={loaderRef} style={{height: "50px", textAlign:"center"}}>
                {loading && "Loading..."}
            </div>
    </>
}
