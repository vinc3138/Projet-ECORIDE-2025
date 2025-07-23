<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AuthControllerTest extends WebTestCase
{
    public function testLoginSuccess()
    {
        $client = static::createClient();

        // Données valides d'un utilisateur existant (à adapter selon ta BDD)
        $payload = [
            'email' => 'user@example.com',
            'password' => 'password123'
        ];

        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $this->assertResponseIsSuccessful();

        $responseData = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('token', $responseData);
        $this->assertArrayHasKey('user', $responseData);
        $this->assertEquals('user@example.com', $responseData['user']['email']);
    }

    public function testLoginFailure()
    {
        $client = static::createClient();

        // Données incorrectes
        $payload = [
            'email' => 'user@example.com',
            'password' => 'wrongpassword'
        ];

        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload)
        );

        $this->assertResponseStatusCodeSame(401);

        $responseData = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('error', $responseData);
        $this->assertEquals('Invalid credentials', $responseData['error']);
    }
}
