import { Html, Head, Body, Container, Text, Heading } from "@react-email/components";

interface Props {
    sellerName: string;
    gigTitle: string;
}

export function OrderPlacedEmail({ sellerName, gigTitle }: Props) {
    return (
        <Html>
            <Head />
            <Body style={{ fontFamily: "sans-serif" }}>
                <Container>
                    <Heading>New order received</Heading>
                    <Text>Hi {sellerName}, you just got an order for "{gigTitle}".</Text>
                    <Text>Log in to SUMMAYH to view the details and get started.</Text>
                </Container>
            </Body>
        </Html>
    );
}