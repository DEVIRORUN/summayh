import { Html, Head, Body, Container, Text, Heading } from "@react-email/components";

interface Props {
    name: string;
    otp: string;
}

export function EmailOtpEmail({ name, otp }: Props) {
    return (
        <Html>
            <Head />
            <Body style={{ fontFamily: "sans-serif" }}>
                <Container>
                    <Heading>Verify your email</Heading>
                    <Text>Hi {name}, your SUMMAYH verification code is:</Text>
                    <Text style={{ fontSize: "28px", fontWeight: "bold" }}>{otp}</Text>
                    <Text>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</Text>
                </Container>
            </Body>
        </Html>
    )
}