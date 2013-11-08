<?php
/**
 * theming-store-symfony
 * Owner: Jonathan Claros <jonathan.claros@syscrunch.com>
 * Date: 7/29/13
 * Time: 4:24 PM
 */

namespace SysCrunch\StoreBundle\DataFixtures\ORM;

use Doctrine\Common\DataFixtures\AbstractFixture;
use Doctrine\Common\DataFixtures\OrderedFixtureInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

use SysCrunch\Base\InitialBundle\Entity\User;
use SysCrunch\StoreBundle\Entity\Template;

class LoadTemplateData extends AbstractFixture implements OrderedFixtureInterface
{
  public function load(ObjectManager $manager){
    /**
     * $currentUser User
     */
    $currentUser = $this->getReference("user-publisher");

    for($i = 0; $i < 100 ; $i ++){

      $entity = new Template();
      $entity->setTitle("Template Nr ". ($i+1));
      $entity->setDescription(" This is the description of the element ");
      if($currentUser instanceof User){
        $entity->setCreatedBy($currentUser);
      }


      $manager->persist($entity);
    }

    $manager->flush();

  }

  public function getOrder(){
    return 2;
  }
}