<?php
namespace SysCrunch\StoreBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\AbstractFixture as AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use SysCrunch\Base\InitialBundle\Entity\User;

/**
 * theming-store-symfony
 * Owner: Jonathan Claros <jonathan.claros@syscrunch.com>
 * Date: 7/29/13
 * Time: 4:02 PM
 */

class LoadUserData extends AbstractFixture implements OrderedFixtureInterface, ContainerAwareInterface
{
  /**
   * @var ContainerInterface
   */
  private $container;

  public function setContainer(ContainerInterface $container = null){
    $this->container = $container;
  }
  public function load(ObjectManager $manager)
  {
    $userAdmin = new User();
    $userAdmin->setUsername("syscrunch");
    $userAdmin->setEmail("jonathan.claros@syscrunch.com");

    $encoder = $this->container->get("security.encoder_factory")
        ->getEncoder($userAdmin);

    $userAdmin->setPassword($encoder->encodePassword("123", $userAdmin->getSalt()));
    $userAdmin->addRole("ROLE_ADMIN");
    $userAdmin->setEnabled(true);
    $userAdmin->setSuperAdmin(true);

    $userPublisher = new User();
    $userPublisher->setUsername("syscrunchpublisher");
    $userPublisher->setEmail("publisher_store@syscrunch.com");

    $encoder = $this->container->get("security.encoder_factory")
        ->getEncoder($userPublisher);

    $userPublisher->setPassword($encoder->encodePassword("123", $userPublisher->getSalt()));
    $userPublisher->addRole("ROLE_PUBLISHER");

    $userPublisher->setEnabled(true);
    $userPublisher->setSuperAdmin(false);


    $userBuyer = new User();
    $userBuyer->setUsername("syscrunchbuyer");
    $userBuyer->setEmail("buyer_store@syscrunch.com");

    $encoder = $this->container->get("security.encoder_factory")
        ->getEncoder($userBuyer);

    $userBuyer->setPassword($encoder->encodePassword("123", $userBuyer->getSalt()));
    $userBuyer->addRole("ROLE_PUBLISHER");

    $userBuyer->setEnabled(true);
    $userBuyer->setSuperAdmin(false);

    $manager->persist($userAdmin);
    $manager->persist($userPublisher);
    $manager->persist($userBuyer);
    $manager->flush();

    $this->addReference('user-admin', $userAdmin);
    $this->addReference('user-publisher', $userPublisher);
    $this->addReference('user-buyer', $userBuyer);

  }

  public function getOrder()
  {
    return 1;
  }

}